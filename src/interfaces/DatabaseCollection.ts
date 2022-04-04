import { Track } from "erela.js";

export interface IGuild {
  id: string;
  prefix?: string;
  music?: {
    curentSong: Track;
    songs: Array<Track>;
    playing: boolean;
    stopped: boolean;
    loop: string | number;
    volume: number;
    timeout: NodeJS.Timeout;
    isDestroy?: {
      status: boolean;
      time: Date;
      stopBy: string;
    };
  };
}
