export type Track = {
  id: string;
  file: File;
  url: string;
  title: string;
  artist: string;
  album: string;
  folder: string;
  duration: number;
  artUrl?: string;
  key: string;
};

export type RepeatMode = "off" | "all" | "one";
