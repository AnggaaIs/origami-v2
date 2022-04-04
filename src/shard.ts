import { ShardingManager, ShardingManagerOptions } from "discord.js";
import config from "../config.json";

const isProduction = process.env.NODE_ENV === "production";

const manager = new ShardingManager("dist/src/app.js", {
  respawn: true,
  token: config.botConfigs.token,
  totalShards: isProduction ? "auto" : 1,
} as ShardingManagerOptions);

manager.spawn({ timeout: 120000 });
