import { useState } from 'react';
import { Loader2, Plus, List, Music, Video } from 'lucide-react';
import { ParseResult } from '../types';
import { cn } from '../lib/utils';

interface ParseInputProps {
  onParsed: (results: ParseResult[], format: 'audio' | 'video', quality: string) => void;
}

export function ParseInput({ onParsed }: ParseInputProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState<'audio' | 'video'>('audio');
  const [quality, setQuality] = useState('192');

  const handleFormatChange = (newFormat: 'audio' | 'video') => {
    setFormat(newFormat);
    setQuality(newFormat === 'audio' ? '192' : '1080');
  };

  const handleParse = async () => {
    if (!inputUrl.trim()) return;

    setIsParsing(true);
    setError('');
    
    // Split by newlines if batch mode, else just one
    const urls = batchMode 
      ? inputUrl.split('\n').map(u => u.trim()).filter(Boolean)
      : [inputUrl.trim()];

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });

      if (!response.ok) {
        let msg = 'Failed to parse input';
        try {
           const errData = await response.json();
           if (errData.error) msg = errData.error;
        } catch(e) {}
        throw new Error(msg);
      }

      const data = await response.json();
      onParsed(data, format, quality);
      setInputUrl('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-1 rounded-full w-fit shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none border border-white/60 dark:border-white/10 transition-colors duration-500">
          <button
            onClick={() => handleFormatChange('audio')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all",
              format === 'audio' 
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Music className="w-3.5 h-3.5" /> MP3 Audio
          </button>
          <button
            onClick={() => handleFormatChange('video')}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all",
              format === 'video' 
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Video className="w-3.5 h-3.5" /> MP4 Video
          </button>
        </div>
        
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md p-1 rounded-full w-fit shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none border border-white/60 dark:border-white/10 transition-colors duration-500">
          <select 
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="appearance-none bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm px-4 py-1.5 rounded-full text-[12px] font-bold outline-none cursor-pointer border-none transition-colors"
          >
            {format === 'audio' ? (
              <>
                <option value="320">320 kbps</option>
                <option value="256">256 kbps</option>
                <option value="192">192 kbps</option>
                <option value="128">128 kbps</option>
              </>
            ) : (
              <>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="relative group">
        {batchMode ? (
          <textarea
            className="w-full h-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-3xl p-5 text-sm focus:outline-none focus:ring-4 focus:ring-white/40 dark:focus:ring-white/10 focus:border-white dark:focus:border-white/20 transition-all resize-none shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-200"
            placeholder="Paste multiple URLs (one per line)..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
          />
        ) : (
          <input
            type="text"
            className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-full pl-5 pr-32 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-white/40 dark:focus:ring-white/10 focus:border-white dark:focus:border-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none placeholder-slate-400 dark:placeholder-slate-500 text-slate-700 dark:text-slate-200"
            placeholder="Paste a URL to download..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          />
        )}
        
        {!batchMode && (
          <div className="absolute right-2 top-2 flex items-center gap-1">
             <button 
                onClick={() => setBatchMode(!batchMode)}
                className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Batch URLs"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={handleParse}
                disabled={isParsing || !inputUrl.trim()}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center transition-all shadow-sm",
                  isParsing || !inputUrl.trim() 
                    ? "bg-white/40 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
                    : "bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-white hover:opacity-90 shadow-md"
                )}
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Download</span>}
              </button>
          </div>
        )}
      </div>

      {batchMode && (
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => setBatchMode(!batchMode)}
            className="px-5 py-2.5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm text-slate-600 dark:text-slate-300 border border-white/50 dark:border-white/10 rounded-full hover:bg-white/60 dark:hover:bg-slate-700/40 transition-colors shadow-sm font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={isParsing || !inputUrl.trim()}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm",
              isParsing || !inputUrl.trim() 
                ? "bg-white/40 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-white/50 dark:border-white/10" 
                : "bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] text-white hover:opacity-90 shadow-md"
            )}
          >
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Process Batch</span>
          </button>
        </div>
      )}

      {error && (
        <div className="text-[#FF3B30] dark:text-[#ff6b63] text-[13px] px-2 font-medium bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border border-white/50 dark:border-white/10 p-3 rounded-xl inline-block w-fit transition-colors">
          {error}
        </div>
      )}
    </div>
  );
}
