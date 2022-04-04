import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Event from "@origami/classes/Event";
import { Node } from "erela.js";

export default class NodeErrorEvent extends Event {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "nodeError",
    });
  }

  async run(node: Node, e: Error): Promise<void> {
    this.log.info(`Lavalink node ${node.options.identifier} error ${e.message}.`);
  }
}
