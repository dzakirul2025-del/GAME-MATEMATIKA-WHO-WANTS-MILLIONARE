import React, { useEffect } from 'react';
import { Star, AlertOctagon, HelpCircle, BarChart3, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ModalEventData } from '../types';

interface EventModalProps {
  data: ModalEventData | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ data, onClose }) => {
  useEffect(() => {
    if (data?.type === 'STAR') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#f59e0b', '#38bdf8', '#ffffff'],
      });
    }
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-slate-900 via-slate-900 to-[#071131] p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {/* Close icon for non-critical modals */}
        {data.type !== 'ELIMINATED' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Icon / Badge */}
        <div className="mx-auto mb-4 flex items-center justify-center">
          {data.type === 'STAR' && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-bounce">
              <Star className="w-10 h-10 text-slate-950 fill-slate-950" />
            </div>
          )}
          {data.type === 'ELIMINATED' && (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
              <AlertOctagon className="w-10 h-10 text-white" />
            </div>
          )}
          {data.type === 'TEACHER_HINT' && (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.4)]">
              <HelpCircle className="w-8 h-8 text-slate-950" />
            </div>
          )}
          {data.type === 'POLL_RESULT' && (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(129,140,248,0.4)]">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          )}
          {data.type === 'INFO' && (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <CheckCircle2 className="w-8 h-8 text-slate-950" />
            </div>
          )}
        </div>

        {/* Modal Title */}
        <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-wide font-serif ${
          data.type === 'STAR' ? 'text-amber-300' :
          data.type === 'ELIMINATED' ? 'text-rose-400' :
          data.type === 'TEACHER_HINT' ? 'text-cyan-300' :
          'text-amber-200'
        }`}>
          {data.title}
        </h2>

        {/* Five Star visual row for Star Bonus */}
        {data.type === 'STAR' && (
          <div className="flex justify-center gap-2 my-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            ))}
          </div>
        )}

        {/* Modal Description Content */}
        <div
          className="my-5 text-sm sm:text-base text-slate-200 leading-relaxed font-normal"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />

        {/* Poll visualization if Poll Event */}
        {data.type === 'POLL_RESULT' && data.pollData && (
          <div className="my-5 space-y-2 text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {data.pollData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Pilihan {item.label}</span>
                  <span className="font-mono">{item.percent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm / Continue Button */}
        <button
          type="button"
          onClick={() => {
            if (data.onConfirm) {
              data.onConfirm();
            }
            onClose();
          }}
          className={`w-full max-w-xs mx-auto py-3 px-6 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            data.type === 'ELIMINATED'
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 hover:brightness-105'
          }`}
        >
          {data.buttonText || 'Lanjutkan Permainan'}
        </button>
      </div>
    </div>
  );
};
