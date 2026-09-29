import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Star, Sparkles, HelpCircle, Users2, ArrowRight } from 'lucide-react';
import { Question, Group, ModalEventData } from '../types';
import { getPrizeForQuestion, formatRupiah, safeHavenLevels } from '../data/ladder';
import { soundManager } from '../utils/sound';

interface GameScreenProps {
  questions: Question[];
  groups: Group[];
  timeLimit: number;
  onFinishGame: (finalGroups: Group[], answeredHistory: Array<{ question: Question; group: Group; isCorrect: boolean }>) => void;
  onTriggerEventModal: (event: ModalEventData) => void;
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'];

export const GameScreen: React.FC<GameScreenProps> = ({
  questions,
  groups: initialGroups,
  timeLimit,
  onFinishGame,
  onTriggerEventModal,
}) => {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [qIndex, setQIndex] = useState<number>(0);
  const [turn, setTurn] = useState<number>(0);

  // Question state
  const currentQuestion = questions[qIndex] || questions[0];
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]); // 50:50 eliminated

  // Selection & Feedback state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('Diskusikan dengan anggota kelompok dan pilih jawaban terbaik.');

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit > 0 ? timeLimit : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // History tracking for final review
  const [answeredHistory, setAnsweredHistory] = useState<Array<{ question: Question; group: Group; isCorrect: boolean }>>([]);

  // Active groups helper
  const activeGroups = groups.filter((g) => !g.eliminated);

  // Get next active turn
  const getNextActiveTurn = (currentTurn: number, groupList: Group[]): number => {
    const active = groupList.filter((g) => !g.eliminated);
    if (active.length === 0) return currentTurn;
    for (let step = 1; step <= groupList.length; step++) {
      const idx = (currentTurn + step) % groupList.length;
      if (!groupList[idx].eliminated) {
        return idx;
      }
    }
    return currentTurn;
  };

  // Shuffle options whenever qIndex changes
  useEffect(() => {
    if (!currentQuestion) return;
    const opts = [...currentQuestion.o].sort(() => Math.random() - 0.5);
    setShuffledOptions(opts);
    setHiddenOptions([]);
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    setShowExplanation(false);
    setFeedbackMessage('Diskusikan dengan anggota kelompok dan pilih jawaban terbaik.');

    // Timer reset
    if (timeLimit > 0) {
      setTimeLeft(timeLimit);
    }
  }, [qIndex, currentQuestion, timeLimit]);

  // Timer loop
  useEffect(() => {
    if (timeLimit <= 0 || isAnswerLocked || showExplanation) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswerSelect(null, true);
          return 0;
        }
        if (prev <= 10) {
          soundManager.playTick(true);
        } else if (prev % 5 === 0) {
          soundManager.playTick(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimit, isAnswerLocked, showExplanation, qIndex, turn]);

  const activeGroup = groups[turn] || groups[0];

  // Handle Answer Selection
  const handleAnswerSelect = (optionText: string | null, isTimeout = false) => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedAnswer(optionText);
    soundManager.playLockIn();

    const isCorrect = !isTimeout && optionText === currentQuestion.a;
    const currentGroupName = activeGroup.name;

    // Record in history
    setAnsweredHistory((prev) => [
      ...prev,
      {
        question: currentQuestion,
        group: { ...activeGroup },
        isCorrect,
      },
    ]);

    // Delay reveal slightly for TV suspense
    setTimeout(() => {
      setShowExplanation(true);

      const updatedGroups = [...groups];
      const g = updatedGroups[turn];

      let starEarnedEvent = false;
      let eliminatedEvent = false;

      if (isCorrect) {
        soundManager.playCorrect();
        g.correct += 1;
        g.points += 10;
        g.correctStreak += 1;
        g.wrongStreak = 0;
        setFeedbackMessage(`✅ Benar! +10 poin untuk ${g.name}. Tangga hadiah meningkat.`);

        // Rule: Bonus 5 stars every 5 consecutive correct answers
        if (g.correctStreak % 5 === 0) {
          g.stars += 5;
          starEarnedEvent = true;
        }
      } else {
        soundManager.playWrong();
        g.wrong += 1;
        g.wrongStreak += 1;
        g.correctStreak = 0;
        setFeedbackMessage(
          isTimeout
            ? `⏰ Waktu habis! Jawaban benar adalah: ${currentQuestion.a}`
            : `❌ Kurang tepat. Jawaban benar adalah: ${currentQuestion.a}`
        );

        // Rule: Eliminated if 5 consecutive wrong answers
        if (g.wrongStreak >= 5) {
          g.eliminated = true;
          eliminatedEvent = true;
        }
      }

      setGroups(updatedGroups);

      // Trigger event modals if applicable
      if (starEarnedEvent) {
        soundManager.playStarBonus();
        onTriggerEventModal({
          type: 'STAR',
          title: 'HORE, KALIAN DAPAT 5 BINTANG!',
          content: `Luar biasa! <b>${currentGroupName}</b> berhasil menjawab benar <b>${g.correctStreak} kali berturut-turut</b>.<br/><br/>Kalian mendapatkan <b>5 BINTANG TAMBAHAN</b>! ⭐⭐⭐⭐⭐<br/>Total koleksi saat ini: <b>${g.stars} Bintang</b>.`,
          buttonText: 'Lanjutkan Permainan',
        });
      } else if (eliminatedEvent) {
        soundManager.playEliminated();
        onTriggerEventModal({
          type: 'ELIMINATED',
          title: 'GAME TERHENTI UNTUK KELOMPOK INI',
          content: `Sayang sekali, <b>${currentGroupName}</b> gagal menjawab benar sebanyak <b>5 kali berturut-turut</b>.<br/><br/>Sesuai aturan resmi, kelompok ini <b>terhenti / gugur</b> dan tidak dapat mengikuti sisa giliran permainan.`,
          buttonText: 'Lanjutkan dengan Kelompok Lain',
        });
      }
    }, 800);
  };

  // Move to next question
  const handleProceedNext = () => {
    const nextQ = qIndex + 1;
    const remainingActive = groups.filter((g) => !g.eliminated);

    if (nextQ >= questions.length || remainingActive.length === 0) {
      onFinishGame(groups, answeredHistory);
      return;
    }

    const nextTurn = getNextActiveTurn(turn, groups);
    setTurn(nextTurn);
    setQIndex(nextQ);
  };

  // Lifeline 1: 50:50
  const handleLifelineFifty = () => {
    if (!activeGroup.lifelines.fifty || isAnswerLocked) return;
    soundManager.playLifeline();

    const wrongOptions = shuffledOptions.filter((opt) => opt !== currentQuestion.a);
    const toRemove = [...wrongOptions].sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(toRemove);

    const updated = [...groups];
    updated[turn].lifelines.fifty = false;
    setGroups(updated);
  };

  // Lifeline 2: Ganti Soal
  const handleLifelineSkip = () => {
    if (!activeGroup.lifelines.skip || isAnswerLocked) return;
    soundManager.playLifeline();

    const updated = [...groups];
    updated[turn].lifelines.skip = false;
    setGroups(updated);

    onTriggerEventModal({
      type: 'INFO',
      title: 'Soal Diganti!',
      content: `Kelompok <b>${activeGroup.name}</b> menggunakan bantuan Ganti Soal. Pertanyaan baru akan segera ditampilkan.`,
      buttonText: 'Buka Soal Pengganti',
      onConfirm: () => {
        const nextQ = qIndex + 1;
        if (nextQ >= questions.length) {
          onFinishGame(groups, answeredHistory);
        } else {
          setQIndex(nextQ);
        }
      },
    });
  };

  // Lifeline 3: Tanya Guru
  const handleLifelineAskTeacher = () => {
    if (!activeGroup.lifelines.ask || isAnswerLocked) return;
    soundManager.playLifeline();

    const updated = [...groups];
    updated[turn].lifelines.ask = false;
    setGroups(updated);

    const hint = currentQuestion.hint || 'Ingat prinsip nilai tempat desimal: persepuluhan (1 angka di belakang koma) dan perseratusan (2 angka di belakang koma).';

    onTriggerEventModal({
      type: 'TEACHER_HINT',
      title: 'Bantuan Guru Pembimbing',
      content: `<div class="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800 text-left mb-2"><b>Tips Konsep dari Guru:</b><br/>"${hint}"</div><p class="text-xs text-slate-300">Gunakan petunjuk ini untuk berdiskusi dengan kelompok!</p>`,
      buttonText: 'Kembali Menjawab',
    });
  };

  // Lifeline 4: Polling Kelas
  const handleLifelinePollClass = () => {
    if (!activeGroup.lifelines.poll || isAnswerLocked) return;
    soundManager.playLifeline();

    const updated = [...groups];
    updated[turn].lifelines.poll = false;
    setGroups(updated);

    // Simulate audience vote with strong weight towards correct answer
    const isCorrectFavored = Math.random() > 0.15;
    const correctPercent = isCorrectFavored ? Math.floor(Math.random() * 25) + 55 : 30;
    const remaining = 100 - correctPercent;
    const wrongCount = shuffledOptions.length - 1;
    const split1 = Math.floor(remaining * 0.5);
    const split2 = Math.floor(remaining * 0.3);
    const split3 = remaining - split1 - split2;
    const wrongSplits = [split1, split2, split3].sort(() => Math.random() - 0.5);

    let wrongIdx = 0;
    const pollData = shuffledOptions.map((opt, i) => {
      const isAns = opt === currentQuestion.a;
      const pct = isAns ? correctPercent : (wrongSplits[wrongIdx++] || 10);
      return {
        label: `${CHOICE_LETTERS[i]} (${opt})`,
        percent: pct,
        isAnswer: isAns,
      };
    });

    onTriggerEventModal({
      type: 'POLL_RESULT',
      title: 'Hasil Polling Seluruh Kelas',
      content: 'Berikut persentase voting dan pendapat dari teman-teman sekelas:',
      pollData,
      buttonText: 'Tentukan Jawaban Final',
    });
  };

  const currentReward = getPrizeForQuestion(qIndex);
  const timerPercentage = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Top Bar Status Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Question Counter */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Progres Permainan
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              Soal {qIndex + 1} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {Math.round(((qIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Active Group Banner */}
        <div className="p-3.5 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 backdrop-blur-md flex items-center justify-between shadow-[0_0_20px_rgba(251,191,36,0.15)]">
          <div className="truncate pr-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Giliran Menjawab
            </div>
            <div className="text-lg font-black text-slate-100 truncate">
              {activeGroup.name}
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              {activeGroup.members.length > 0 ? activeGroup.members.join(' · ') : 'Seluruh Anggota'}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-2">
            <div className="flex items-center gap-1 text-yellow-400 font-black text-sm">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span>{activeGroup.stars}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Streak: <b className="text-emerald-400">{activeGroup.correctStreak}</b> 🔥
            </div>
          </div>
        </div>

        {/* Current Prize Value */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Nilai Hadiah Soal
            </div>
            <div className="text-xl font-black text-amber-300 font-mono tracking-wide">
              {formatRupiah(currentReward)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Game Arena: Quiz Center & Side Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Center Arena (3 Columns on Large Screens) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-5 sm:p-7 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#0c183d] via-[#091331] to-[#040817] shadow-2xl relative overflow-hidden">
            {/* Timer Bar */}
            {timeLimit > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-mono font-bold mb-1.5">
                  <span className="text-slate-400">Sisa Waktu Diskusi</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      timeLeft <= 10 ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'text-cyan-400'
                    }`}
                  >
                    {timeLeft} Detik
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      timeLeft <= 10
                        ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                        : timeLeft <= 20
                        ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                        : 'bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                    }`}
                    style={{ width: `${timerPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Question Display Box */}
            <div className="relative my-4 px-6 py-8 rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-slate-950 via-[#0d1a45] to-slate-950 shadow-[0_0_35px_rgba(251,191,36,0.15)] text-center min-h-[140px] flex items-center justify-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full border border-amber-400 bg-slate-950 text-amber-300 text-xs font-bold uppercase tracking-widest">
                Pertanyaan {qIndex + 1}
              </div>
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-100 leading-snug tracking-tight text-balance">
                {currentQuestion.q}
              </h2>
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
              {shuffledOptions.map((opt, idx) => {
                const letter = CHOICE_LETTERS[idx];
                const isHidden = hiddenOptions.includes(opt);
                const isSelected = selectedAnswer === opt;
                const isCorrectAnswer = opt === currentQuestion.a;

                let buttonStyle = 'border-slate-700 bg-slate-900/80 hover:border-amber-400 hover:bg-[#122254] text-slate-100';

                if (isHidden) {
                  buttonStyle = 'border-slate-800 bg-slate-950/40 text-slate-600 opacity-20 pointer-events-none';
                } else if (showExplanation) {
                  if (isCorrectAnswer) {
                    buttonStyle = 'border-emerald-400 bg-emerald-950 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.4)] animate-pulse';
                  } else if (isSelected && !isCorrectAnswer) {
                    buttonStyle = 'border-rose-500 bg-rose-950 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
                  } else {
                    buttonStyle = 'border-slate-800 bg-slate-950/60 text-slate-500 opacity-60';
                  }
                } else if (isSelected) {
                  buttonStyle = 'border-amber-400 bg-amber-950/80 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.4)]';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerLocked || isHidden}
                    onClick={() => handleAnswerSelect(opt)}
                    className={`relative p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 cursor-pointer group ${buttonStyle}`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-950 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0 font-mono group-hover:border-amber-400">
                      {letter}
                    </span>
                    <span className="text-base sm:text-lg font-semibold tracking-wide flex-1 break-words">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lifeline Bar */}
            <div className="border-t border-slate-800 pt-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bantuan Lifeline ({activeGroup.name}):
                </span>
                <span className="text-[11px] text-slate-500">
                  Masing-masing 1x kesempatan
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 50:50 */}
                <button
                  type="button"
                  disabled={!activeGroup.lifelines.fifty || isAnswerLocked}
                  onClick={handleLifelineFifty}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>50 : 50</span>
                </button>

                {/* Ganti Soal */}
                <button
                  type="button"
                  disabled={!activeGroup.lifelines.skip || isAnswerLocked}
                  onClick={handleLifelineSkip}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-yellow-400" />
                  <span>Ganti Soal</span>
                </button>

                {/* Tanya Guru */}
                <button
                  type="button"
                  disabled={!activeGroup.lifelines.ask || isAnswerLocked}
                  onClick={handleLifelineAskTeacher}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Tanya Guru</span>
                </button>

                {/* Polling Kelas */}
                <button
                  type="button"
                  disabled={!activeGroup.lifelines.poll || isAnswerLocked}
                  onClick={handleLifelinePollClass}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users2 className="w-4 h-4 text-indigo-400" />
                  <span>Polling Kelas</span>
                </button>
              </div>
            </div>

            {/* Explanation & Next Step Drawer */}
            {showExplanation && (
              <div className="mt-6 p-4 sm:p-5 rounded-xl border border-amber-400/40 bg-slate-950/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Penjelasan & Pembahasan Konsep
                    </div>
                    <p className="text-sm text-slate-200 font-medium">
                      {feedbackMessage}
                    </p>
                    {currentQuestion.explanation && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
                        💡 {currentQuestion.explanation}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedNext}
                    className="py-3 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-sm flex items-center gap-2 shrink-0 cursor-pointer shadow-lg transition-transform hover:scale-[1.02]"
                  >
                    <span>Lanjut ke Soal Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Tangga Hadiah & Mini Standings */}
        <div className="space-y-4">
          {/* Live Standings Panel */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Status Kelompok
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeGroups.length} Aktif
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {groups.map((g, idx) => {
                const isCurrent = idx === turn;
                return (
                  <div
                    key={g.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      g.eliminated
                        ? 'border-rose-950 bg-rose-950/20 text-rose-400/60 line-through'
                        : isCurrent
                        ? 'border-amber-400 bg-amber-950/30 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.2)] font-bold'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-semibold">
                        {isCurrent && !g.eliminated ? '▶ ' : ''}{g.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-yellow-400">⭐ {g.stars}</span>
                        <span>·</span>
                        <span>{g.correct} benar</span>
                        {g.wrongStreak > 0 && !g.eliminated && (
                          <>
                            <span>·</span>
                            <span className="text-rose-400 font-mono">❌ {g.wrongStreak}/5</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="font-mono font-bold text-right shrink-0">
                      {g.eliminated ? (
                        <span className="text-[10px] text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900">
                          GUGUR
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs">{g.points} pt</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tangga Hadiah (Prize Ladder) */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                Tangga Hadiah
              </h3>
              <span className="text-[11px] text-slate-400">100 Level</span>
            </div>

            <div className="flex flex-col-reverse gap-1 max-h-72 overflow-y-auto pr-1">
              {Array.from({ length: questions.length }, (_, lvlIdx) => {
                const isCurrentLvl = lvlIdx === qIndex;
                const isPassed = lvlIdx < qIndex;
                const amount = getPrizeForQuestion(lvlIdx);
                const isMilestone = safeHavenLevels.includes(lvlIdx + 1);

                return (
                  <div
                    key={lvlIdx}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center justify-between font-mono transition-colors ${
                      isCurrentLvl
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                        : isMilestone
                        ? 'bg-slate-800/90 text-amber-300 font-bold border border-amber-500/30'
                        : isPassed
                        ? 'text-slate-500'
                        : 'text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="w-7 text-[11px]">
                      {lvlIdx + 1}
                    </span>
                    <span className="text-[11px] truncate">
                      {formatRupiah(amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
