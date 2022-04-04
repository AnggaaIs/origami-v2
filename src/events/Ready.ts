import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";

export default class ReadyEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "ready",
    });
  }

  async run(): Promise<void> {
    this.client.erela.init(this.client.user.id);

    this.client.user.setActivity({
      name: "Hmmmppph >//<",
      type: 2,
    });
  }
}
