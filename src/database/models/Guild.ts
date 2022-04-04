import { model, Schema } from "mongoose";
import { IGuild } from "@origami/interfaces";

import config from "@root/config.json";

const GuildSchema = new Schema<IGuild>({
  id: { required: true, type: String },
  prefix: { required: false, type: String, default: config.botConfigs.prefix },
  music: { required: false, type: Object, default: undefined },
});

export default model<IGuild>("Guild", GuildSchema);
