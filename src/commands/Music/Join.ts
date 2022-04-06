import Command from "@origami/classes/Command";
import CommandContext from "@origami/classes/CommandContext";
import Client from "@origami/classes/Client";
import Logger from "@origami/classes/Logger";
import { Message } from "discord.js";

export default class JoinCommand extends Command {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "join",
      description: "Join voice channel.",
      category: "Music",
      cooldown: 20,
      clientPermissions: ["CONNECT"],
      userPermissions: ["CONNECT"],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const { channel } = ctx.interaction.guild.members.cache.get(ctx.interaction.user.id).voice;
    const players = this.client.erela.players.get(ctx.interaction.guildId);
    if (!channel) return ctx.sendMessage("Please join a voice channel first!", { ephemeral: true });

    if (players) {
      if (channel.id === players.voiceChannel)
        return ctx.sendMessage(`I've been connected to that voice channel.`, { ephemeral: true });

      if (channel.id !== players.voiceChannel) {
        if (players.playing || players.queue.length !== 0)
          return ctx.sendMessage(`There are songs in Queue, you can't do that!`, { ephemeral: true });
      }
    }

    await ctx.interaction.deferReply();

    const player = this.client.erela.create({
      guild: ctx.interaction.guildId,
      textChannel: ctx.interaction.channelId,
      voiceChannel: channel.id,
      selfDeafen: true,
    });

    if (players && players.state === "DISCONNECTED") {
      players.setVoiceChannel(channel.id);
      players.connect();
    }
    if (player.state !== "CONNECTED") player.connect();
    if (players && players.state === "CONNECTED") {
      if (!players.playing || players.queue.length === 0) player.setVoiceChannel(channel.id);
    }
    ctx.interaction.followUp(`Joined voice vhannel \`${channel.name}\`.`);
    setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);
  }
}
