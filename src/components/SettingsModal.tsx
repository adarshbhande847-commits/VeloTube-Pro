import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [cookies, setCookies] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings').then(res => res.json()).then(data => {
        if (data.cookies) setCookies(data.cookies);
      }).catch(console.error);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies })
      });
      if (res.ok) {
        setStatus('success');
        setTimeout(onClose, 1000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-white/60 dark:border-white/10 w-full max-w-[500px] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/40 dark:border-white/10 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ff9a9e]" />
            Bot Protection Bypass
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            YouTube aggressively blocks datacenter IPs. To bypass the "Sign in to confirm you're not a bot" error, you must extract cookies from your local browser and paste them here (in Netscape format).
          </p>
          
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Netscape Cookies.txt Content
            </label>
            <textarea
              value={cookies}
              onChange={e => setCookies(e.target.value)}
              className="w-full h-40 bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-white/10 rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#ff9a9e] resize-none shadow-inner text-slate-700 dark:text-slate-300"
              placeholder="# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tFALSE\t1720000000\tLOGIN_INFO\t..."
            />
          </div>
          
          {status === 'success' && (
            <p className="text-sm text-emerald-500 mt-3 font-medium">Settings saved successfully!</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-500 mt-3 font-medium">Failed to save settings.</p>
          )}
        </div>

        <div className="p-5 border-t border-white/40 dark:border-white/10 flex justify-end gap-3 bg-white/40 dark:bg-slate-800/40 shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white/60 dark:bg-slate-700/60 border border-white/50 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 font-medium text-sm rounded-full hover:bg-white/80 dark:hover:bg-slate-600/60 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md text-white",
              saving ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] hover:opacity-90"
            )}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
