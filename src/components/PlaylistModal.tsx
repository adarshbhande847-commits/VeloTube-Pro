import { useState } from 'react';
import { ParseResult, DownloadItem } from '../types';
import { ListVideo, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PlaylistModalProps {
  playlist: ParseResult;
  format: 'audio' | 'video';
  onClose: () => void;
  onConfirm: (items: DownloadItem[]) => void;
}

export function PlaylistModal({ playlist, format, onClose, onConfirm }: PlaylistModalProps) {
  const [view, setView] = useState<'prompt' | 'select'>('prompt');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(playlist.items?.map((_, i) => i))
  );

  const handleDownloadAll = () => {
    const items = generateDownloadItems(playlist.items || []);
    onConfirm(items);
  };

  const handleDownloadSpecific = () => {
    const selected = (playlist.items || []).filter((_, i) => selectedIndices.has(i));
    onConfirm(generateDownloadItems(selected));
  };

  const generateDownloadItems = (items: any[]): DownloadItem[] => {
    return items.map((item, index) => ({
      id: crypto.randomUUID(),
      videoId: item.id,
      url: item.url,
      title: item.title,
      channel: item.channel,
      duration: item.duration,
      thumbnail: item.thumbnail,
      type: format,
      quality: playlist.quality,
      playlistId: playlist.id,
      playlistTitle: playlist.title,
      index: index + 1, // 1-based index
      status: 'pending',
      progress: 0
    }));
  };

  const toggleSelection = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={cn(
          "bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-white/60 dark:border-white/10 w-full overflow-hidden flex flex-col max-h-[85vh] transition-colors duration-500",
          view === 'prompt' ? "max-w-[320px] p-6" : "max-w-[420px]"
        )}
      >
        {view === 'prompt' ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-[#ff9a9e] to-[#fecfef]">
                <ListVideo className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 transition-colors">Playlist Detected</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-snug transition-colors">
                 <span className="font-medium text-slate-700 dark:text-slate-300">{playlist.title}</span><br/>
                 {playlist.items?.length || 0} videos
              </p>
            </div>
            <div className="space-y-2">
              <button 
                onClick={handleDownloadAll}
                className="w-full py-3 bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-white rounded-2xl text-[13px] font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Download All
              </button>
              <button 
                onClick={() => setView('select')}
                className="w-full py-3 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl text-[13px] font-medium hover:bg-white/80 dark:hover:bg-slate-700/50 transition-colors border border-white/50 dark:border-white/10"
              >
                Select Specific...
              </button>
              <button 
                onClick={onClose}
                className="w-full py-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-[12px] font-medium transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full overflow-hidden bg-white/30 dark:bg-slate-900/30 transition-colors">
            <div className="p-4 border-b border-white/40 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shrink-0 transition-colors">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 transition-colors">
                {selectedIndices.size} selected
              </span>
              <button 
                onClick={() => setSelectedIndices(new Set(playlist.items?.map((_, i) => i)))}
                className="text-[11px] text-[#ff9a9e] hover:text-[#ff7b81] font-bold uppercase tracking-wider transition-colors"
              >
                Select All
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {playlist.items?.map((item, i) => (
                <div 
                  key={i}
                  onClick={() => toggleSelection(i)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-colors duration-500 shadow-sm border",
                    selectedIndices.has(i) ? "bg-white/80 dark:bg-slate-700/80 border-white/80 dark:border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:shadow-none" : "bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-white/10 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className={cn("shrink-0 transition-colors", selectedIndices.has(i) ? "text-[#ff9a9e]" : "text-slate-300 dark:text-slate-600")}>
                    {selectedIndices.has(i) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </div>
                  <div className="w-12 h-8 rounded-lg bg-white/50 dark:bg-slate-700/50 overflow-hidden shrink-0 relative border border-black/5 dark:border-white/5 transition-colors">
                     <img src={item.thumbnail} alt="" className="w-full h-full object-cover absolute inset-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate transition-colors">{item.title}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate transition-colors">{item.channel}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/40 dark:border-white/10 flex justify-end gap-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shrink-0 transition-colors">
              <button 
                onClick={() => setView('prompt')}
                className="px-5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 font-medium text-[12px] rounded-full hover:bg-white/80 dark:hover:bg-slate-600/60 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleDownloadSpecific}
                disabled={selectedIndices.size === 0}
                className="px-6 py-2.5 bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-white font-bold text-[12px] rounded-full shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Queue {selectedIndices.size}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
