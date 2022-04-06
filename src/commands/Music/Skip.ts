import Command from "@origami/classes/Command";
import CommandContext from "@origami/classes/CommandContext";
import Client from "@origami/classes/Client";
import Logger from "@origami/classes/Logger";
import { Message } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export default class SkipCommand extends Command {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "skip",
      description: "Skip track.",
      category: "Music",
      cooldown: 5,
      clientPermissions: ["CONNECT"],
      userPermissions: ["CONNECT"],
      options: [
        {
          name: "track",
          description: "Enter the track number.",
          type: ApplicationCommandOptionTypes.NUMBER,
          required: false,
        },
      ],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const trackNumber = ctx.interaction.options.getNumber("track");
    const { channel } = ctx.interaction.guild.members.cache.get(ctx.interaction.user.id).voice;
    const players = this.client.erela.players.get(ctx.interaction.guildId);

    if (!channel) return ctx.sendMessage("Please join a voice channel first!", { ephemeral: true });
    if (!players) return ctx.sendMessage("There are no songs played now.", { ephemeral: true });

    if (players) {
      if (!players.voiceChannel)
        return ctx.sendMessage("Queue is detected, please use the `Join` command before using this command.");
    }
  }
}
