import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, BookOpen, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  onOpenRules: () => void;
  onResetGame?: () => void;
  showReset?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRules, onResetGame, showReset }) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playTick();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <header className="border-b border-amber-500/20 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 uppercase font-serif drop-shadow-sm">
              Who Wants to Be a Millionaire?
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-300">Matematika Kelas 6</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Bilangan Desimal</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-400 font-medium">100 Soal Wajib</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors text-xs font-medium cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden md:inline">{isMuted ? 'Bisu' : 'Suara Aktif'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            title="Lihat Aturan Permainan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors text-xs font-medium cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Aturan</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {showReset && onResetGame && (
            <button
              type="button"
              onClick={onResetGame}
              title="Atur Ulang Permainan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors text-xs font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Keluar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
