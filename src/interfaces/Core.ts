import { ApplicationCommandOptionData, PermissionString } from "discord.js";

export interface IEvent {
  name: string;
}

export interface ICommand {
  name: string;
  description?: string;
  category?: string;
  cooldown?: number;
  devOnly?: boolean;
  inDm?: boolean;
  clientPermissions?: PermissionString[];
  userPermissions?: PermissionString[];
  options?: ApplicationCommandOptionData[];
}
