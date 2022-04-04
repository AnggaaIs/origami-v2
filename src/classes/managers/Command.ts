import Logger from "@origami/classes/Logger";
import Client from "@origami/classes/Client";
import Command from "@origami/classes/Command";
import { readdirSync } from "fs";

export default class CommandManager {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {}

  async init(path: string): Promise<void> {
    try {
      const directory = readdirSync(path, { withFileTypes: true });

      directory.forEach(async (a) => {
        if (a.isDirectory()) {
          return this.init(`${path}/${a.name}`);
        }

        const ImportedCommand = (await import(`${path}/${a.name}`)).default;
        const command: Command = new ImportedCommand(this.client);

        this.client.commands.set(command.name.toLowerCase(), command);
      });
    } catch (err) {
      this.log.error(`Failed to load commands ${err}`);
    }
  }
}
