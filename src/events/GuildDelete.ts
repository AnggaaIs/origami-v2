import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Guild } from "discord.js";

export default class GuildDeleteEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "guildDelete",
    });
  }

  async run(guild: Guild): Promise<void> {
    this.client.database.guild.deleteOne(guild.id);
    this.log.info(`${guild.name} deleted from database.`);
  }
}
