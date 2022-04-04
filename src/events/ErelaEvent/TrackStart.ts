import { Colors } from "@origami/utils/Constants";
import { MessageEmbed, TextChannel } from "discord.js";
import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Player, Track } from "erela.js";
import prettyMilliseconds from "pretty-ms";

export default class TrackStartEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "trackStart",
    });
  }

  async run(player: Player, track: Track): Promise<void> {
    const duration = track.isStream ? "🔴 Live" : prettyMilliseconds(track.duration, { colonNotation: true });
    const displayThumbnail = track.displayThumbnail() ?? `https://img.youtube.com/vi/${track.identifier}/default.jpg`;
    const embed = new MessageEmbed()
      .setTitle("🎶 Started playing")
      .setColor(Colors.general)
      .setThumbnail(displayThumbnail)
      .addField("Title", `[${track.title}](${track.uri})`)
      .addField("Author", track.author)
      .addField("Duration", duration)
      .addField("Requested by", `<@${track.requester}>`)
      .setTimestamp();

    const textChannel = this.client.channels.cache.get(player.textChannel) as TextChannel;
    textChannel.send({ embeds: [embed] });
  }
}
