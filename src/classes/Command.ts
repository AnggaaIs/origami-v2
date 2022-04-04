import CommandContext from "@origami/classes/CommandContext";
import { ICommand } from "@origami/interfaces";
import { ApplicationCommandOptionData, PermissionString } from "discord.js";
import Client from "./Client";

export default abstract class Command {
  name?: string;
  description?: string;
  category?: string;
  cooldown?: number;
  devOnly?: boolean;
  inDm?: boolean;
  clientPermissions?: PermissionString[];
  userPermissions?: PermissionString[];
  options?: ApplicationCommandOptionData[];

  constructor(protected client: Client, opt: ICommand) {
    this.client = client;
    this.name = opt.name;
    this.description = opt.description || "No description provided.";
    this.category = opt.category || "Uncategorized";
    this.cooldown = opt.cooldown || 2;
    this.devOnly = opt.devOnly || false;
    this.inDm = opt.inDm || false;
    this.clientPermissions = opt.clientPermissions || [];
    this.userPermissions = opt.userPermissions || [];
    this.options = opt.options || [];
  }

  abstract run(ctx: CommandContext): void;
}
