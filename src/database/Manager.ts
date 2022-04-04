import Client from "@origami/classes/Client";
import Logger from "@origami/classes/Logger";
import GuildService from "@origami/database/services/Guild";
import GuildModel from "@origami/database/models/Guild";
import mongoose from "mongoose";

export default class DatabaseManager {
  private log = new Logger(this.constructor.name);
  public guild = new GuildService(GuildModel);

  constructor(protected client: Client) {}

  async connect(): Promise<void> {
    mongoose.connect(this.client.config.otherConfigs.mongo).catch((err) => {
      if (err) {
        this.log.error(`Failed connect to database ${err}`);
      }
    });
  }

  async close(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      this.log.info("Mongoose connection is closed.");
      process.exit();
    } else {
      this.log.error("You can't do that.");
    }
  }
}
