import React, { useState } from 'react';
import { Users, Clock, Play, Sparkles, AlertTriangle, ShieldCheck, Shuffle } from 'lucide-react';
import { Group } from '../types';
import { soundManager } from '../utils/sound';

interface SetupScreenProps {
  onStartGame: (groups: Group[], timeLimit: number, shuffleQuestions: boolean) => void;
}

const defaultGroupNames = [
  'Kelompok Al-Khawarizmi',
  'Kelompok Pythagoras',
  'Kelompok Archimedes',
  'Kelompok Gauss',
  'Kelompok Newton',
  'Kelompok Euler',
  'Kelompok Descartes',
  'Kelompok Pascal',
];

const sampleMemberNames = [
  ['Ahmad', 'Budi', 'Citra', 'Dian'],
  ['Eka', 'Fajar', 'Gita', 'Hadi'],
  ['Indah', 'Joko', 'Kiki', 'Lestari'],
  ['Mega', 'Naufal', 'Olivia', 'Putra'],
  ['Qori', 'Rizky', 'Siti', 'Taufik'],
  ['Utari', 'Vino', 'Wulan', 'Xavier'],
  ['Yusuf', 'Zahra', 'Aldi', 'Bella'],
  ['Cahyo', 'Dewi', 'Erick', 'Fitri'],
];

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame }) => {
  const [groupCount, setGroupCount] = useState<number>(8);
  const [timeLimit, setTimeLimit] = useState<number>(45);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);

  // Group names and members state
  const [groupData, setGroupData] = useState<Array<{ name: string; members: string[] }>>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      name: `Kelompok ${i + 1}`,
      members: ['', '', '', ''],
    }));
  });

  const handleGroupCountChange = (count: number) => {
    setGroupCount(count);
    if (count > groupData.length) {
      const extra = Array.from({ length: count - groupData.length }, (_, i) => ({
        name: `Kelompok ${groupData.length + i + 1}`,
        members: ['', '', '', ''],
      }));
      setGroupData([...groupData, ...extra]);
    }
  };

  const updateGroupName = (index: number, name: string) => {
    const updated = [...groupData];
    updated[index].name = name;
    setGroupData(updated);
  };

  const updateMember = (groupIndex: number, memberIndex: number, value: string) => {
    const updated = [...groupData];
    updated[groupIndex].members[memberIndex] = value;
    setGroupData(updated);
  };

  const handleAutoFill = () => {
    soundManager.playLifeline();
    const filled = Array.from({ length: groupCount }, (_, i) => ({
      name: defaultGroupNames[i] || `Kelompok ${i + 1}`,
      members: sampleMemberNames[i] ? [...sampleMemberNames[i]] : ['Siswa 1', 'Siswa 2', 'Siswa 3', 'Siswa 4'],
    }));
    setGroupData(filled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playLockIn();

    const formattedGroups: Group[] = [];
    for (let i = 0; i < groupCount; i++) {
      const g = groupData[i] || { name: `Kelompok ${i + 1}`, members: [] };
      const validMembers = g.members.map((m) => m.trim()).filter(Boolean);
      formattedGroups.push({
        id: i + 1,
        name: g.name.trim() || `Kelompok ${i + 1}`,
        members: validMembers.length > 0 ? validMembers : [`Anggota ${i + 1}`],
        points: 0,
        stars: 0,
        correct: 0,
        wrong: 0,
        correctStreak: 0,
        wrongStreak: 0,
        eliminated: false,
        lifelines: {
          fifty: true,
          skip: true,
          ask: true,
          poll: true,
        },
      });
    }

    onStartGame(formattedGroups, timeLimit, shuffleQuestions);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title Banner */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 uppercase font-serif">
          Atur Permainan Beregu
        </h1>
        <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Format cerdas cermat televisi bergiliran untuk 8 kelompok matematika SD kelas 6. Uji pemahaman konsep pecahan, desimal, dan perbandingan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Game Rules Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-amber-300">Bonus 5 Bintang</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Setiap kelompok yang berhasil menjawab benar <b>5 kali berturut-turut</b> akan mendapatkan bonus <b>5 BINTANG</b> (berlaku kelipatan 5, 10, 15...).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-rose-300">Sistem Gugur Beruntun</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Kelompok yang gagal menjawab benar <b>5 kali berturut-turut</b> otomatis <b>tereliminasi / terhenti</b> dari sisa putaran permainan.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-slate-900/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-cyan-300">4 Bantuan Lifeline</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Setiap kelompok dibekali bantuan: <b>50:50</b> (buang 2 salah), <b>Ganti Soal</b>, <b>Tanya Guru</b>, dan <b>Polling Kelas</b>.
              </p>
            </div>
          </div>
        </div>

        {/* Global Settings */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-slate-100">Pengaturan Umum Sesi</h2>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Isi Contoh Nama Cepat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Group Count */}
            <div>
              <label htmlFor="group-count-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Jumlah Kelompok
              </label>
              <select
                id="group-count-select"
                value={groupCount}
                onChange={(e) => handleGroupCountChange(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-amber-400 font-medium text-sm"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} Kelompok {num === 8 ? '(Standar Sesuai Aturan)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Limit */}
            <div>
              <label htmlFor="time-limit-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Waktu Menjawab Per Soal
              </label>
              <select
                id="time-limit-select"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-amber-400 font-medium text-sm"
              >
                <option value={30}>30 Detik (Tantangan Cepat)</option>
                <option value={45}>45 Detik (Direkomendasikan)</option>
                <option value={60}>60 Detik (Santai & Diskusi)</option>
                <option value={90}>90 Detik (Analisis Mendalam)</option>
                <option value={0}>Tanpa Batas Waktu (Bebas)</option>
              </select>
            </div>

            {/* Question Ordering */}
            <div>
              <label htmlFor="order-mode-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Urutan 100 Soal
              </label>
              <select
                id="order-mode-select"
                value={shuffleQuestions ? 'shuffle' : 'linear'}
                onChange={(e) => setShuffleQuestions(e.target.value === 'shuffle')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:border-amber-400 font-medium text-sm"
              >
                <option value="linear">Berurutan (Mulai dari Pecahan Dasar ke Mengurutkan)</option>
                <option value="shuffle">Acak (Seluruh 100 Soal Diacak)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Groups Configuration Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200">
              Daftar Kelompok & Anggota ({groupCount} Kelompok)
            </h2>
            <span className="text-xs text-slate-400">
              Maksimal 4 anggota per kelompok. Anggota ke-5 tidak dapat diinput.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: groupCount }, (_, gIdx) => {
              const g = groupData[gIdx] || { name: `Kelompok ${gIdx + 1}`, members: ['', '', '', ''] };
              return (
                <div
                  key={gIdx}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Kelompok {gIdx + 1}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Maks. 4 Anggota
                    </span>
                  </div>

                  {/* Group Name */}
                  <div className="mb-3">
                    <label htmlFor={`gname-${gIdx}`} className="block text-xs text-slate-400 mb-1">Nama Kelompok</label>
                    <input
                      id={`gname-${gIdx}`}
                      type="text"
                      value={g.name}
                      maxLength={35}
                      onChange={(e) => updateGroupName(gIdx, e.target.value)}
                      placeholder={`Kelompok ${gIdx + 1}`}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                    />
                  </div>

                  {/* 4 Member Inputs (Rule: max 4, cannot add 5th) */}
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((mIdx) => (
                      <div key={mIdx}>
                        <label htmlFor={`g${gIdx}-m${mIdx}`} className="block text-[11px] text-slate-500 mb-0.5">
                          Anggota {mIdx + 1}
                        </label>
                        <input
                          id={`g${gIdx}-m${mIdx}`}
                          type="text"
                          value={g.members[mIdx] || ''}
                          maxLength={25}
                          onChange={(e) => updateMember(gIdx, mIdx, e.target.value)}
                          placeholder={`Nama ${mIdx + 1}`}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="pt-4 text-center">
          <button
            type="submit"
            className="w-full max-w-md mx-auto py-4 px-8 rounded-xl font-black text-slate-950 text-base uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            Mulai Permainan (100 Soal)
          </button>
          <p className="mt-3 text-xs text-slate-500">
            Pastikan seluruh perwakilan kelompok telah siap di tempat duduk masing-masing.
          </p>
        </div>
      </form>
    </div>
  );
};
