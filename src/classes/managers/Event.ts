import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import { readdirSync } from "fs";

export default class EventManager {
  private log = new Logger(this.constructor.name);
  constructor(protected client: Client) {}

  async init(path: string): Promise<void> {
    try {
      const directory = readdirSync(path, { withFileTypes: true });

      directory.forEach(async (a) => {
        if (a.isDirectory()) {
          return this.init(`${path}/${a.name}`);
        }

        const ImportedEvent = (await import(`${path}/${a.name}`)).default;
        const event = new ImportedEvent(this.client);

        if (path.includes("ErelaEvent")) {
          this.client.erela.on(event.name, (...params) => event.run(...params));
        } else {
          this.client.on(event.name, (...params) => event.run(...params));
        }
      });
    } catch (err) {
      this.log.error(`Failed to load events ${err}`);
    }
  }
}
