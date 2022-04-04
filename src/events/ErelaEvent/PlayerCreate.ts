import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Player } from "erela.js";

export default class PlayerCreateEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "playerCreate",
    });
  }

  async run(player: Player): Promise<void> {
    this.log.info(`Player created in the guild ${player.guild}`);
  }
}
