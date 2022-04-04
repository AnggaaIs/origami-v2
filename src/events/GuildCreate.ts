import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Guild } from "discord.js";

export default class GuildCreateEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "guildCreate",
    });
  }

  async run(guild: Guild): Promise<void> {
    this.client.database.guild.create(guild.id).then((data) => {
      if (data) return;
      this.log.info(`${guild.name} saved to database.`);
    });
  }
}
