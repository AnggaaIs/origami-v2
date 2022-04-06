import Command from "@origami/classes/Command";
import CommandContext from "@origami/classes/CommandContext";
import Client from "@origami/classes/Client";
import Logger from "@origami/classes/Logger";
import { Message } from "discord.js";

export default class LeaveCommand extends Command {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "leave",
      description: "Leave voice channel.",
      category: "Music",
      cooldown: 20,
      clientPermissions: ["CONNECT"],
      userPermissions: ["CONNECT"],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const { channel } = ctx.interaction.guild.members.cache.get(ctx.interaction.user.id).voice;
    const players = this.client.erela.players.get(ctx.interaction.guildId);

    if (!players) return ctx.sendMessage("You can't do that!", { ephemeral: true });
    if (!channel) return ctx.sendMessage("Please join a voice channel first!", { ephemeral: true });

    if (players && players.voiceChannel) {
      const clientVoiceChannel = ctx.interaction.guild.channels.cache.get(players.voiceChannel);
      if (channel.id !== players.voiceChannel)
        return ctx.sendMessage(`You must be on the voice channel ${clientVoiceChannel.name} to run this command!`, {
          ephemeral: true,
        });
    }

    await ctx.interaction.deferReply();

    if (players.state === "CONNECTED") players.disconnect();

    await ctx.interaction.followUp(`Leaved voice channel \`${channel.name}\`.`);
    setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);
  }
}
