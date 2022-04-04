import Command from "@origami/classes/Command";
import CommandContext from "@origami/classes/CommandContext";
import Client from "@origami/classes/Client";
import Logger from "@origami/classes/Logger";
import { Message } from "discord.js";

export default class PingCommand extends Command {
  private log = new Logger(this.constructor.name);

  constructor(protected client: Client) {
    super(client, {
      name: "ping",
      description: "Check bot latency.",
      category: "Utility",
      cooldown: 5,
    });
  }

  async run(ctx: CommandContext): Promise<Message | void> {
    const wsPing = this.client.ws.ping;
    ctx.sendMessage(
      `🏓 Pong - Roundtrip \`${Math.round(Date.now() - ctx.interaction.createdTimestamp)}ms\`, API \`${wsPing}ms\``
    );
  }
}
