import DatabaseManager from "@origami/database/Manager";
import {
  ApplicationCommand,
  ApplicationCommandDataResolvable,
  ChatInputApplicationCommandData,
  Client,
  ClientOptions,
  Collection,
} from "discord.js";
import mongoose from "mongoose";
import { join } from "path";
import Command from "./Command";
import Logger from "./Logger";
import CommandManager from "./managers/Command";
import EventManager from "./managers/Event";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { Manager, VoicePacket } from "erela.js";

const folderEvent = join(__dirname, "../events");
const folderCommand = join(__dirname, "../commands");

export default class OrigamiClient extends Client {
  private log = new Logger(this.constructor.name);
  private eventManager = new EventManager(this);
  private commandManager = new CommandManager(this);
  public config = require("../../config.json");
  public commands: Collection<string, Command> = new Collection();
  public cooldowns: Collection<string, Collection<string, number>> = new Collection();
  public erela = this.erelaHandler();
  public database = new DatabaseManager(this);

  constructor(options?: ClientOptions) {
    super(options);
  }

  async init(): Promise<void> {
    try {
      await this.database.connect();

      this.eventManager.init(folderEvent).then(() => {
        this.log.info(`Events succesfully load.`);
      });

      this.commandManager.init(folderCommand).then(() => {
        this.log.info(`Commands succesfully load.`);
      });

      mongoose.connection.on("connected", () => {
        this.log.info("Database (MongoDb) connected.");
        this.login(this.config.botConfigs.token);
      });

      this.once("ready", () => {
        this.log.info(`${this.user.tag} Connected to API Discord.`);
        this.syncApplicationCommands();
        //this.erela.on("trackStart", ())
      });
    } catch (err) {
      this.log.error(`Failed to start a bot ${err}`);
    }
  }

  async syncApplicationCommands(): Promise<void> {
    try {
      this.log.info("Sync application commands! please wait.");
      const isProduction = process.env.NODE_ENV === "production";

      let commandList: Array<ApplicationCommandDataResolvable> = [];

      let commandsRegister: any;
      if (isProduction) commandsRegister = await this.application.commands.fetch();
      else commandsRegister = await this.application.commands.fetch({ guildId: this.config.otherConfigs.guild_id });

      const { commands } = this;
      commands.forEach((cmd: Command) => {
        const option: ChatInputApplicationCommandData = {
          name: cmd.name.toLowerCase(),
          description: cmd.description as string,
          type: ApplicationCommandTypes["CHAT_INPUT"],
          options: cmd.options,
        };

        if (isProduction) {
          if (cmd.category === "Dev" && cmd.devOnly) return;
        }
        commandList.push(option);
      });

      if (isProduction) {
        for (const cmd of commandList) {
          await this.application.commands.create(cmd);
        }

        const deletedCommands = commandsRegister.filter((a: ApplicationCommand) => !commandList.some((b) => b.name === a.name));

        deletedCommands.forEach(async (dCmd: ApplicationCommand) => {
          await this.application.commands.delete(dCmd.id);
        });

        this.log.info("Application command is successfully synchronized globally.");
      } else {
        for (const cmd of commandList) {
          await this.application.commands.create(cmd, this.config.otherConfigs.guild_id);
        }

        const deletedGuildsCommands = commandsRegister.filter(
          (a: ApplicationCommand) => !commandList.some((b) => b.name === a.name)
        );

        deletedGuildsCommands.forEach(async (dCmd: ApplicationCommand) => {
          await this.application.commands.delete(dCmd.id, this.config.otherConfigs.guild_id);
        });

        const guild = this.guilds.cache.get(this.config.otherConfigs.guild_id);
        this.log.info(`Application command is successfully synchronized in the guild ${guild.name}.`);
      }
    } catch (err) {
      this.log.error(`Application command failed to sync ${err.stack}`);
    }
  }

  private erelaHandler(): Manager {
    const erela = new Manager({
      autoPlay: true,
      nodes: this.config.botConfigs.lavalink.nodes,

      send: (id, payload) => {
        const guild = this.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });

    this.on("raw", (p: VoicePacket) => {
      erela.updateVoiceState(p);
    });
    return erela;
  }
}
