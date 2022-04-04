import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Node } from "erela.js";

export default class NodeReconnectEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "nodeReconnect",
    });
  }

  async run(node: Node): Promise<void> {
    this.log.info(`Lavalink node ${node.options.identifier} reconnecting...`);
  }
}
