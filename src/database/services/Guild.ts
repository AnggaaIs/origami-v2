import Logger from "@origami/classes/Logger";
import Guild from "@origami/database/models/Guild";
import { IGuild } from "@origami/interfaces";

export default class GuildService {
  private log = new Logger(this.constructor.name);

  constructor(private guild: typeof Guild) {}

  async create(id: string): Promise<IGuild | void | null> {
    const data = await this.guild.findOne({ id });
    if (data) return data;

    const create = this.guild.create({ id });
    return create;
  }

  async findOne(id: string): Promise<IGuild | void | null> {
    const data = await this.guild.findOne({ id });
    if (data) return data;
    return null;
  }

  async deleteOne(id: string): Promise<void | null> {
    const data = await this.guild.findOne({ id });
    if (data) this.guild.deleteOne({ id });
    return null;
  }
}
