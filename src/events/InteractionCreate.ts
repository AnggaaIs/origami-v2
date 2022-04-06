import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Interaction, TextChannel, User, Message, PermissionString, MessageEmbed } from "discord.js";
import CommandContext from "@origami/classes/CommandContext";
import Command from "@origami/classes/Command";
import Collection from "@discordjs/collection";
import { toTitleCase } from "../utils";
import { Colors } from "../utils/Constants";

export default class InteractionCreateEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "interactionCreate",
    });
  }

  async run(interaction: Interaction): Promise<Message | void> {
    if (!interaction.isCommand()) return;

    const ctx = new CommandContext(this.client, interaction);
    const user: User = ctx.interaction.user;

    const commandName = ctx.interaction.commandName;
    const command: Command = this.client.commands.get(commandName.toLowerCase());
    if (!command) return;

    if (command.devOnly && !this.client.config.otherConfigs.owners.includes(user.id)) return;

    if (!command.inDm && ctx.interaction.channel.type === "DM") {
      ctx.sendMessage("Sorry, this command can only be execute on the server.", { timeout: 15000 });
      return;
    }

    if (ctx.interaction.inGuild()) {
      const textChannel = ctx.interaction.channel as TextChannel;
      const clientPermissions = this.client.guilds.cache
        .get(ctx.interaction.guildId)
        .members.cache.get(this.client.user.id).permissions;
      const userPermissions = this.client.guilds.cache
        .get(ctx.interaction.guildId)
        .members.cache.get(ctx.interaction.user.id).permissions;

      if (!textChannel.permissionsFor(this.client.user.id).has("SEND_MESSAGES") || !clientPermissions.has("SEND_MESSAGES")) {
        ctx.interaction.user
          .send({ content: `<@${ctx.interaction.user.id}>, I don't have permission to send messages on <#${textChannel.id}>.` })
          .then((msg) => {
            setTimeout(() => {
              msg.delete();
            }, 120000); // 2  Minutes
          })
          .catch(() => {});
        return;
      }

      if (!textChannel.permissionsFor(this.client.user.id).has("EMBED_LINKS") || !clientPermissions.has("EMBED_LINKS")) {
        ctx.sendMessage("I need `embed links` permission to work properly!", { timeout: 30000 });
        return;
      }

      const { clientPermissions: cPerm, userPermissions: uPerm } = command;
      const cPermArray: Array<PermissionString> = [];
      const uPermArray: Array<PermissionString> = [];

      // Client permissions handler
      if (cPerm.length > 0) {
        cPerm.forEach((perm: PermissionString) => {
          if (!clientPermissions.has(perm)) cPermArray.push(perm);
        });
      }

      //User permissions handler
      if (uPerm.length > 0) {
        uPerm.forEach((perm: PermissionString) => {
          if (!userPermissions.has(perm)) uPermArray.push(perm);
        });
      }

      if (cPermArray.length > 0) {
        const perm = cPermArray.map((perm: PermissionString) => `${toTitleCase(perm.replace(/_/g, " "))}`).join(", ");
        ctx.sendMessage(`I don't have \`${perm}\` permission to run this command!`, { timeout: 15000 });
        return;
      }

      if (uPermArray.length > 0) {
        const perm = uPermArray.map((perm: PermissionString) => `${toTitleCase(perm.replace(/_/g, " "))}`);
        ctx.sendMessage(`You don't have \`${perm}\` permission to run this command!s`, { ephemeral: true });
        return;
      }
    }

    if (command.cooldown || command.cooldown > 0) {
      if (!this.client.cooldowns.has(command.name)) this.client.cooldowns.set(command.name, new Collection());

      const timeStamp: Collection<string, number> = this.client.cooldowns.get(command.name);
      const amount: number = command.cooldown * 1000;

      if (!timeStamp.has(ctx.interaction.user.id)) {
        timeStamp.set(ctx.interaction.user.id, Date.now());

        // Delete cooldown for owner :v
        if (this.client.config.otherConfigs.owners.includes(ctx.interaction.user.id)) timeStamp.delete(ctx.interaction.user.id);
      } else {
        const time = timeStamp.get(ctx.interaction.user.id) + amount;
        if (Date.now() < time) {
          const timeLeft = (time - Date.now()) / 1000;

          ctx.sendMessage(`Oopppss, wait \`${timeLeft.toFixed(1)}\` seconds to try it again.`, { ephemeral: true });
          return;
        }

        timeStamp.set(ctx.interaction.user.id, Date.now());
        setTimeout(() => timeStamp.delete(ctx.interaction.user.id), amount);
      }
    }

    new Promise((resolve) => {
      resolve(command.run(ctx));
    }).catch((err) => {
      this.log.error(err.stack);
    });
  }
}
