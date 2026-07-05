import { DownloadItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

interface QueueDashboardProps {
  queue: DownloadItem[];
  activeCount: number;
  stopDownload: (id: string) => void;
}

export function QueueDashboard({ queue, activeCount, stopDownload }: QueueDashboardProps) {
  if (queue.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
         <div className="w-16 h-16 bg-[#F2F2F7] dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-[#E5E5EA] dark:border-slate-700 transition-colors">
           <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
         </div>
         <h2 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">No Downloads</h2>
         <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Add a URL to get started.</p>
      </div>
    );
  }

  const completedItems = queue.filter(q => q.status === 'completed');
  const activeItems = queue.filter(q => q.status !== 'completed');

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0 w-full max-w-4xl mx-auto h-full overflow-y-auto pb-8">
      
      {activeItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/20 dark:border-white/10 shrink-0">
            <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Queue</h2>
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 px-3 py-1 rounded-full shadow-sm transition-colors">{activeItems.length} items</span>
          </div>
          <div className="space-y-3 px-1">
            <AnimatePresence mode="popLayout">
              {activeItems.map((item, i) => (
                <QueueItemCard key={item.id} item={item} index={i + 1} stopDownload={stopDownload} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {completedItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/20 dark:border-white/10 shrink-0 mt-4">
            <h2 className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Downloaded Contents</h2>
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 px-3 py-1 rounded-full shadow-sm transition-colors">{completedItems.length} items</span>
          </div>
          <div className="space-y-3 px-1">
            <AnimatePresence mode="popLayout">
              {completedItems.map((item, i) => (
                <QueueItemCard key={item.id} item={item} index={i + 1} stopDownload={stopDownload} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function QueueItemCard({ item, index, stopDownload }: { item: DownloadItem, index: number, key?: string, stopDownload: (id: string) => void }) {
  const isDownloading = item.status === 'downloading';
  const isError = item.status === 'error';
  const isPending = item.status === 'pending';
  const isCompleted = item.status === 'completed';
  const isStopped = item.status === 'stopped';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "p-4 rounded-3xl flex items-center gap-4 transition-colors duration-500 border backdrop-blur-md",
        isDownloading ? "bg-white/60 dark:bg-slate-800/60 border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none" : 
        isError ? "bg-red-50/50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30" :
        (isPending || isStopped) ? "bg-white/30 dark:bg-slate-800/30 border-white/40 dark:border-white/10" :
        "bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-white/10 opacity-80"
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/50 dark:bg-slate-700/50 flex items-center justify-center font-medium shrink-0 text-[11px] overflow-hidden relative shadow-sm transition-colors">
        {item.thumbnail ? (
          <>
            <img src={item.thumbnail} alt="" className="w-full h-full object-cover absolute inset-0 opacity-80" />
            <div className="absolute inset-0 bg-black/5" />
          </>
        ) : (
          <span className="text-slate-400">{index}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {isDownloading ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{item.title}</span>
              <span className="text-[11px] font-bold text-[#ff9a9e] shrink-0">{Math.round(item.progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white dark:bg-slate-700 rounded-full overflow-hidden shadow-inner transition-colors">
              <div 
                className="h-full bg-gradient-to-r from-[#ff9a9e] to-[#fecfef] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </>
        ) : isError ? (
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full mb-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{item.title}</span>
              <span className="text-[11px] text-red-500 font-bold shrink-0 uppercase tracking-wider">Failed</span>
            </div>
            <span className="text-[10px] text-red-400 line-clamp-2">{item.errorMessage || 'An error occurred'}</span>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full">
            <span className={cn("text-sm font-medium truncate pr-2 transition-colors", (isPending || isStopped) ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-300")}>
              {item.title}
            </span>
            <span className={cn("text-[11px] font-bold shrink-0 uppercase tracking-wider transition-colors", isPending ? "text-slate-400 dark:text-slate-500" : isStopped ? "text-orange-400 dark:text-orange-500" : "text-emerald-500 dark:text-emerald-400")}>
              {isPending ? 'Waiting' : isStopped ? 'Stopped' : 'Done'}
            </span>
          </div>
        )}
      </div>

      {(isDownloading || isPending) && (
        <button 
          onClick={() => stopDownload(item.id)}
          className="ml-2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
          title="Stop download"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
