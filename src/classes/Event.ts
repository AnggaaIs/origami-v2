import { IEvent } from "@origami/interfaces";
import Client from "./Client";

export default abstract class Event {
  name: string;

  constructor(protected client: Client, opt: IEvent) {
    this.client = client;
    this.name = opt.name;
  }

  abstract run(...params: unknown[]): void;
}
