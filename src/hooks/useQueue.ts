import { useState, useRef, useCallback, useEffect } from 'react';
import { DownloadItem } from '../types';
import { sanitizeFilename } from '../lib/utils';

export function useQueue() {
  const [queue, setQueue] = useState<DownloadItem[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0); // bytes per second
  
  const recentBytesRef = useRef(0);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      setDownloadSpeed(recentBytesRef.current);
      recentBytesRef.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const reportBytes = useCallback((bytes: number) => {
    recentBytesRef.current += bytes;
  }, []);

  const maxConcurrent = 3;

  const addToQueue = useCallback((items: DownloadItem[]) => {
    setQueue(prev => [...prev, ...items]);
  }, []);

  const stopDownload = useCallback((id: string) => {
    // Check if it's currently downloading
    const controller = abortControllersRef.current.get(id);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(id);
    }
    
    setQueue(prev => prev.map(item => {
      if (item.id === id && (item.status === 'pending' || item.status === 'downloading')) {
        return { ...item, status: 'stopped' };
      }
      return item;
    }));
  }, []);

  const processQueue = useCallback(async () => {
    if (activeCount >= maxConcurrent) return;

    setQueue(prev => {
      const nextItems = prev.filter(item => item.status === 'pending');
      const slotsAvailable = maxConcurrent - activeCount;
      const itemsToStart = nextItems.slice(0, slotsAvailable);

      if (itemsToStart.length === 0) return prev;

      itemsToStart.forEach(item => {
        item.status = 'downloading';
        item.progress = 0;
        
        const controller = new AbortController();
        abortControllersRef.current.set(item.id, controller);
        
        startDownload(item, controller.signal);
      });

      return [...prev];
    });
  }, [activeCount, queue]);

  const startDownload = async (item: DownloadItem, signal: AbortSignal) => {
    setActiveCount(prev => prev + 1);
    try {
      await downloadAsBlob(item, updateProgress, reportBytes, signal);
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Download aborted:', item.title);
      } else {
        console.error('Download error for', item.title, err);
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', errorMessage: err.message } : q));
      }
    } finally {
      abortControllersRef.current.delete(item.id);
      setActiveCount(prev => prev - 1);
    }
  };

  const updateProgress = (id: string, progress: number) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, progress } : q));
  };

  return {
    queue,
    addToQueue,
    processQueue,
    stopDownload,
    activeCount,
    downloadSpeed
  };
}

async function downloadAsBlob(
  item: DownloadItem, 
  updateProgress: (id: string, progress: number) => void,
  reportBytes: (bytes: number) => void,
  signal: AbortSignal
) {
  const url = new URL('/api/download', window.location.origin);
  url.searchParams.set('url', item.url);
  url.searchParams.set('format', item.type);
  if(item.title) url.searchParams.set('title', item.title);
  if(item.channel) url.searchParams.set('channel', item.channel);
  if(item.playlistTitle) url.searchParams.set('playlistTitle', item.playlistTitle);
  if(item.index) url.searchParams.set('index', item.index.toString());
  if(item.quality) url.searchParams.set('quality', item.quality);

  const response = await fetch(url.toString(), { signal });

  if(!response.ok) {
    let msg = 'Download failed on server';
    try {
      msg = await response.text();
    } catch(e) {}
    throw new Error(msg);
  }
  
  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
  
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    chunks.push(value);
    receivedBytes += value.length;
    reportBytes(value.length);
    
    if (totalBytes > 0) {
      updateProgress(item.id, (receivedBytes / totalBytes) * 100);
    } else {
      // Just a fake progress if length isn't known
      updateProgress(item.id, Math.min(99, (receivedBytes / (1024 * 1024 * 10)) * 100)); // assumes 10MB avg
    }
  }

  const blob = new Blob(chunks);
  const downloadUrl = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = downloadUrl;
  let filename = '';
  const fileExt = item.type === 'video' ? 'mp4' : 'mp3';
  if (item.playlistTitle && item.index) {
    filename = `${sanitizeFilename(item.playlistTitle)} - ${item.index.toString().padStart(2, '0')} - ${sanitizeFilename(item.title)}.${fileExt}`;
  } else {
    filename = `${sanitizeFilename(item.title)}.${fileExt}`;
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}
