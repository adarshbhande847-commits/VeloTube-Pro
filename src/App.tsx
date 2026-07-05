import { useState, useEffect } from 'react';
import { Settings2, Music, Activity, Moon, Sun } from 'lucide-react';
import { ParseInput } from './components/ParseInput';
import { PlaylistModal } from './components/PlaylistModal';
import { QueueDashboard } from './components/QueueDashboard';
import { SettingsModal } from './components/SettingsModal';
import { useQueue } from './hooks/useQueue';
import { ParseResult, DownloadItem } from './types';
import { cn } from './lib/utils';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const { 
    queue, 
    addToQueue,
    processQueue,
    stopDownload,
    activeCount,
    downloadSpeed
  } = useQueue();

  const [activePlaylist, setActivePlaylist] = useState<{ playlist: ParseResult, format: 'audio' | 'video' } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto-process queue when it changes or active count drops
  useEffect(() => {
    processQueue();
  }, [queue, activeCount, processQueue]);

  const handleParsed = (results: ParseResult[], format: 'audio' | 'video', quality: string) => {
    const playlists = results.filter(r => r.type === 'playlist');
    const singles = results.filter(r => r.type === 'video');

    if (singles.length > 0) {
      const items: DownloadItem[] = singles.map(s => ({
        id: crypto.randomUUID(),
        videoId: s.id!,
        url: s.url,
        title: s.title || 'Unknown Video',
        channel: s.channel || 'Unknown Channel',
        duration: s.duration,
        thumbnail: s.thumbnail,
        type: format,
        quality,
        status: 'pending',
        progress: 0
      }));
      addToQueue(items);
    }

    if (playlists.length > 0) {
      setActivePlaylist({ playlist: { ...playlists[0], quality }, format });
    }
  };

  const handlePlaylistConfirm = (items: DownloadItem[]) => {
    addToQueue(items);
    setActivePlaylist(null);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-0 md:p-8 font-sans overflow-hidden bg-gradient-to-br from-[#F5E3E6] via-[#E8E6F1] to-[#D9D6F3] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      <div className="w-full h-full md:max-w-[1200px] md:h-[90vh] md:rounded-[32px] md:shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:md:shadow-[0_8px_32px_rgba(0,0,0,0.4)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/60 dark:border-white/10 flex flex-col overflow-hidden transition-colors duration-500">
        
        {/* Header */}
        <header className="h-20 px-6 md:px-10 flex items-center shrink-0 w-full pt-4 select-none border-b border-white/20 dark:border-white/10">
          <div className="flex items-center gap-3 w-56 shrink-0">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] shadow-sm"></div>
             <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">VeloTube Pro</span>
          </div>
          <div className="flex-1">
             <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden md:block">Dashboard</h1>
          </div>
          <div className="flex justify-end gap-3 text-slate-500 dark:text-slate-400">
             <div 
               onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
               className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white/80 dark:hover:bg-white/20 transition-colors"
             >
               {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" /> : <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />}
             </div>
             <div 
               onClick={() => setSettingsOpen(true)}
               className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white/80 dark:hover:bg-white/20 transition-colors"
             >
               <Settings2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
             </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input & Status */}
          <aside className="w-full md:w-80 p-6 flex flex-col gap-6 shrink-0 border-r border-white/20 dark:border-white/10 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2 md:hidden">Dashboard</h1>
                <ParseInput onParsed={handleParsed} />
              </div>
              
              <div className="px-5 py-4 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/50 dark:border-white/10 backdrop-blur-sm shadow-sm transition-colors duration-500">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queue Status</span>
                  {activeCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff9a9e] animate-pulse">
                      <Activity className="w-3.5 h-3.5" />
                      {((downloadSpeed * 8) / 1_000_000).toFixed(2)} Mbps
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex justify-between items-center bg-white/30 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg transition-colors">
                    <span>Total Items</span>
                    <span className="font-bold">{queue.length}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/30 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg transition-colors">
                    <span>Active</span>
                    <span className={cn("font-bold", activeCount > 0 ? "text-[#ff9a9e]" : "text-slate-500 dark:text-slate-400")}>
                      {activeCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/30 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg transition-colors">
                    <span>Downloaded</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {queue.filter(q => q.status === 'completed').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Panel - Queue */}
          <section className="flex-1 p-6 md:p-10 overflow-y-auto bg-white/10 dark:bg-slate-900/20 transition-colors duration-500">
             <QueueDashboard queue={queue} activeCount={activeCount} stopDownload={stopDownload} />
          </section>
        </main>
      </div>

      {/* Playlist Modal */}
      <AnimatePresence>
        {activePlaylist && (
          <PlaylistModal 
            playlist={activePlaylist.playlist}
            format={activePlaylist.format}
            onClose={() => setActivePlaylist(null)} 
            onConfirm={handlePlaylistConfirm} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
