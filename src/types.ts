export type DownloadItem = {
  id: string; // unique ID for the queue
  videoId: string; // YouTube video ID
  url: string;
  title: string;
  channel: string;
  duration?: string | number;
  thumbnail?: string;
  type: 'video' | 'audio';
  quality?: string;
  
  // Playlist context
  playlistId?: string;
  playlistTitle?: string;
  index?: number;

  // Queue state
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'stopped';
  progress: number; // 0-100
  errorMessage?: string;
};

export type ParseResult = {
  type: 'video' | 'playlist' | 'invalid';
  quality?: string;
  url: string;
  id?: string;
  title?: string;
  channel?: string;
  duration?: string | number;
  thumbnail?: string;
  items?: Omit<ParseResult, 'items' | 'type'>[];
};
