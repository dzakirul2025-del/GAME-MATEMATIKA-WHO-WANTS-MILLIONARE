import React from 'react';
import { X, CheckCircle2, Star, AlertOctagon, HelpCircle, Trophy } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase font-serif">
            Aturan Resmi Permainan Beregu
          </h2>
        </div>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4" /> 1. Format Soal & Giliran
            </h3>
            <p>
              Terdapat <b>100 soal wajib</b> bertema Bilangan Desimal dan Pecahan kelas 6 SD. Setiap soal dikerjakan bergiliran antarkelompok aktif. Jawaban benar memberikan <b>+10 poin</b> dan kenaikan tangga hadiah.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20">
            <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 2. Bonus 5 Bintang
            </h3>
            <p>
              Jika suatu kelompok berhasil menjawab benar <b>5 kali berturut-turut</b> (streak 5, 10, 15, dst.), kelompok tersebut dihadiahi <b>5 BINTANG</b>!
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20">
            <h3 className="font-bold text-rose-300 flex items-center gap-2 mb-1">
              <AlertOctagon className="w-4 h-4 text-rose-400" /> 3. Eliminasi / Game Terhenti
            </h3>
            <p>
              Jika suatu kelompok salah berturut-turut sebanyak <b>5 kali</b>, kelompok tersebut dinyatakan <b>gugur / terhenti</b> dan tidak lagi mendapat giliran hingga akhir permainan.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
            <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-cyan-400" /> 4. Bantuan Lifelines (Masing-Masing 1x Pakai)
            </h3>
            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-300">
              <li><b>50 : 50</b>: Menghapus 2 pilihan jawaban yang salah.</li>
              <li><b>Ganti Soal</b>: Menukar soal yang sedang dihadapi dengan soal berikutnya.</li>
              <li><b>Tanya Guru</b>: Meminta tips cara cepat atau konsep matematika dari guru.</li>
              <li><b>Polling Kelas</b>: Melakukan voting pendapat siswa satu kelas.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <h3 className="font-bold text-slate-200 mb-1">5. Anggota Kelompok</h3>
            <p>
              Setiap kelompok beranggotakan maksimal 4 siswa. Seluruh anggota berdiskusi bersama sebelum menentukan jawaban final.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm cursor-pointer transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
