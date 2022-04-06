import Command from "@origami/classes/Command";
import CommandContext from "@origami/classes/CommandContext";
import Client from "@origami/classes/Client";
import Logger from "@origami/classes/Logger";
import { Message } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Player } from "erela.js";

type SearchPlatform = "youtube" | "soundcloud";

export default class PlayCommand extends Command {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "play",
      description: "Play songs.",
      category: "Music",
      cooldown: 5,
      clientPermissions: ["CONNECT"],
      userPermissions: ["CONNECT", "SPEAK"],
      options: [
        {
          name: "query",
          description: "Entor song title/link/playlist link.",
          required: true,
          type: ApplicationCommandOptionTypes.STRING,
        },
        {
          choices: [
            {
              name: "Youtube",
              value: "youtube",
            },
            {
              name: "Soundcloud",
              value: "soundcloud",
            },
          ],
          name: "source",
          description: "Source music (default Youtube)",
          type: ApplicationCommandOptionTypes.STRING,
        },
      ],
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const query = ctx.interaction.options.getString("query");
    const source = (ctx.interaction.options.getString("source") ?? "youtube") as SearchPlatform;
    const { channel } = ctx.interaction.guild.members.cache.get(ctx.interaction.user.id).voice;
    const currentPlayer = this.client.erela.players.get(ctx.interaction.guildId);
    let player: Player;

    if (!channel) return ctx.sendMessage("Please join a voice channel first!", { ephemeral: true });

    if (currentPlayer) {
      if (!currentPlayer.voiceChannel) currentPlayer.setVoiceChannel(channel.id);
      player = this.client.erela.players.get(ctx.interaction.guildId);
    } else {
      player = this.client.erela.create({
        guild: ctx.interaction.guildId,
        textChannel: ctx.interaction.channelId,
        voiceChannel: channel.id,
        selfDeafen: true,
      });
    }

    if (player && player.voiceChannel) {
      const clientVoiceChannel = ctx.interaction.guild.channels.cache.get(player.voiceChannel);
      if (channel.id !== clientVoiceChannel.id)
        return ctx.sendMessage(`You must be on the voice channel ${clientVoiceChannel.name} to run this command!`, {
          ephemeral: true,
        });
    }

    await ctx.interaction.deferReply();

    const response = await player.search({ query, source }, ctx.interaction.user.id);

    if (player.state !== "CONNECTED") player.connect();

    if (response.exception) {
      if (player.state === "CONNECTED" && !player.playing && player.queue.length === 0) player.destroy();
      await ctx.interaction.followUp({ content: "An unknown error occured, please try again later." });
      setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);
      return;
    }

    switch (response.loadType) {
      case "LOAD_FAILED":
        if (player.state === "CONNECTED" && !player.playing && player.queue.length === 0) player.destroy();
        await ctx.interaction.followUp({ content: "Failed to load song, please try again later." });
        setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);
        break;
      case "NO_MATCHES":
        if (player.state === "CONNECTED" && !player.playing && player.queue.length === 0) player.destroy();
        await ctx.interaction.followUp({ content: `Songs cannot be found with query \`${query}\`` });
        setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);
        break;
      case "TRACK_LOADED":
      case "SEARCH_RESULT":
        await ctx.interaction.followUp({ content: `Added to queue \`${response.tracks[0].title}\`` });
        setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);

        if (!player.playing && player.paused && player.queue.current !== null) {
          await ctx.interaction.channel
            .send(`Hola <@${ctx.interaction.user.id}>, Session restored, playing \`${player.queue.current.title}\``)
            .then((a) => {
              setTimeout(() => {
                if (a.deletable) a.delete();
              }, 20000);
            });
          player.queue.add(response.tracks[0]);
          player.pause(!player.paused);
          return;
        }
        player.queue.add(response.tracks[0]);

        if (!player.playing && !player.paused && player.queue.length === 0) player.play();
        break;
      case "PLAYLIST_LOADED":
        await ctx.interaction.followUp({
          content: `**${response.tracks.length + 1}** Songs in the \`${response.playlist.name}\` playlist added to the queue.`,
        });
        setTimeout(async () => await ctx.interaction.deleteReply().catch(() => {}), 15000);

        if (!player.playing && player.paused && player.queue.current !== null) {
          await ctx.interaction.channel
            .send(`Hola <@${ctx.interaction.user.id}>, Session restored, playing \`${player.queue.current.title}\``)
            .then((a) => {
              setTimeout(() => {
                if (a.deletable) a.delete();
              }, 20000);
            });
          player.queue.add(response.tracks);
          player.pause(!player.paused);
          return;
        }
        player.queue.add(response.tracks);

        if (!player.playing && !player.paused && player.queue.length === 0) player.play();
    }
  }
}
