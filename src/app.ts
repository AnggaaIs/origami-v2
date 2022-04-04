import { ClientOptions, Intents } from "discord.js";
import Client from "@origami/classes/Client";
import Logger from "./classes/Logger";

const log = new Logger();

const client = new Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
} as ClientOptions);

client.init();

process.on("unhandleRejection", (err) => {
  log.error(err.stack);
});

process.on("uncaughtException", (err) => {
  log.error(err.stack);
});
