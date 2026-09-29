import React, { useEffect, useState } from 'react';
import { Trophy, Star, RotateCcw, Printer, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Group, Question } from '../types';
import { soundManager } from '../utils/sound';

interface ResultScreenProps {
  groups: Group[];
  history: Array<{ question: Question; group: Group; isCorrect: boolean }>;
  onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ groups, history, onRestart }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'wrong'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Sort groups by points first, then stars, then correct count
  const sortedGroups = [...groups].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return b.correct - a.correct;
  });

  const winner = sortedGroups[0];

  useEffect(() => {
    soundManager.playVictory();

    // Multi-stage confetti celebration
    const end = Date.now() + 3 * 1000;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredHistory = history.filter((item) => {
    if (filterMode === 'correct' && !item.isCorrect) return false;
    if (filterMode === 'wrong' && item.isCorrect) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      return (
        item.question.q.toLowerCase().includes(q) ||
        item.group.name.toLowerCase().includes(q) ||
        item.question.a.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAnswered = history.length;
  const totalCorrect = history.filter((h) => h.isCorrect).length;
  const totalWrong = totalAnswered - totalCorrect;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Grand Title Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          Sesi Permainan Selesai
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 uppercase font-serif tracking-tight">
          Rekapitulasi Hasil Juara
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Selamat kepada seluruh kelompok atas perjuangan menguasai 100 soal konsep pecahan dan bilangan desimal!
        </p>
      </div>

      {/* Top Podium (1st, 2nd, 3rd) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        {sortedGroups[1] && (
          <div className="order-2 md:order-1 p-5 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-700/60 border border-slate-500 flex items-center justify-center font-bold text-slate-200 text-lg">
              2
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Runner Up 1</div>
              <h2 className="text-lg font-bold text-slate-100">{sortedGroups[1].name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{sortedGroups[1].members.join(' · ')}</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-center gap-4 text-xs font-mono">
              <span className="text-amber-400 font-bold">{sortedGroups[1].points} Poin</span>
              <span className="text-yellow-400">⭐ {sortedGroups[1].stars}</span>
              <span className="text-slate-400">{sortedGroups[1].correct} Benar</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        {winner && (
          <div className="order-1 md:order-2 p-6 sm:p-7 rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-950/40 via-slate-900 to-[#0b173e] text-center space-y-3.5 shadow-[0_0_40px_rgba(251,191,36,0.3)]">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-400 uppercase tracking-widest">
                🏆 JUARA UTAMA MILLIONAIRE
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-200 mt-1">
                {winner.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                {winner.members.join(' · ')}
              </p>
            </div>
            <div className="pt-3 border-t border-amber-500/30 flex justify-center gap-5 text-sm font-mono font-bold">
              <span className="text-amber-300">{winner.points} Poin</span>
              <span className="text-yellow-400 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400" />
                {winner.stars} Bintang
              </span>
              <span className="text-emerald-400">{winner.correct} Benar</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {sortedGroups[2] && (
          <div className="order-3 md:order-3 p-5 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-900/40 border border-amber-700/60 flex items-center justify-center font-bold text-amber-500 text-lg">
              3
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Runner Up 2</div>
              <h2 className="text-lg font-bold text-slate-100">{sortedGroups[2].name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{sortedGroups[2].members.join(' · ')}</p>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-center gap-4 text-xs font-mono">
              <span className="text-amber-400 font-bold">{sortedGroups[2].points} Poin</span>
              <span className="text-yellow-400">⭐ {sortedGroups[2].stars}</span>
              <span className="text-slate-400">{sortedGroups[2].correct} Benar</span>
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-xs text-slate-400">Total Soal Dimainkan</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{totalAnswered} Soal</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-xs text-slate-400">Tingkat Ketepatan Kelas</div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{overallAccuracy}%</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-xs text-slate-400">Jawaban Benar</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{totalCorrect}</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
          <div className="text-xs text-slate-400">Jawaban Salah</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">{totalWrong}</div>
        </div>
      </div>

      {/* Complete Standings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-slate-200">
            Klasemen Akhir Seluruh Kelompok
          </h2>
          <span className="text-xs text-slate-400">
            Urutan berdasarkan Poin Tertinggi & Total Bintang
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3 text-center w-14">Pos</th>
                <th className="px-5 py-3">Nama Kelompok</th>
                <th className="px-5 py-3">Anggota</th>
                <th className="px-5 py-3 text-right">Poin</th>
                <th className="px-5 py-3 text-center">Bintang</th>
                <th className="px-5 py-3 text-center">Benar / Salah</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {sortedGroups.map((g, idx) => (
                <tr
                  key={g.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    idx === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 text-center font-bold font-mono text-slate-300">
                    {idx + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-100">{g.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {g.members.length > 0 ? g.members.join(', ') : '-'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold font-mono text-amber-400">
                    {g.points} pt
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-yellow-400 font-bold">
                    ⭐ {g.stars}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-xs">
                    <span className="text-emerald-400">{g.correct}</span> /{' '}
                    <span className="text-rose-400">{g.wrong}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {g.eliminated ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 border border-rose-900 text-rose-400">
                        Terhenti (5x Salah)
                      </span>
                    ) : idx === 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 border border-amber-800 text-amber-300">
                        Juara 1
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 border border-emerald-900 text-emerald-300">
                        Aktif Selesai
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question & Answer History Review (Educational Value) */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Evaluasi & Pembahasan Soal yang Telah Dikerjakan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan pembahasan ini untuk review materi di depan kelas bersama siswa.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari soal atau kelompok..."
                className="pl-8 pr-3 py-1 rounded-lg border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filterMode === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('correct')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filterMode === 'correct' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Benar ({totalCorrect})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('wrong')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  filterMode === 'wrong' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Salah ({totalWrong})
              </button>
            </div>
          </div>
        </div>

        {/* History Cards List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Tidak ada riwayat soal yang sesuai dengan filter pencarian.
            </div>
          ) : (
            filteredHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">
                      #{item.question.id}
                    </span>
                    <span className="text-slate-300 font-semibold">
                      Dijawab oleh: <span className="text-slate-100">{item.group.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.isCorrect ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+10)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Salah
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-100">
                  {item.question.q}
                </div>

                <div className="flex items-center gap-2 text-slate-300 pt-1">
                  <span className="text-emerald-400 font-bold">Kunci Jawaban: {item.question.a}</span>
                </div>

                {item.question.explanation && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                    💡 <b>Pembahasan:</b> {item.question.explanation}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
        <button
          type="button"
          onClick={handlePrint}
          className="py-3 px-6 rounded-xl font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan Rekap PDF</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="py-3 px-8 rounded-xl font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(251,191,36,0.3)] transition-all hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Mulai Permainan Baru</span>
        </button>
      </div>
    </div>
  );
};
