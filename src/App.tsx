import { useState } from 'react';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';
import { EventModal } from './components/EventModal';
import { RulesModal } from './components/RulesModal';
import { questionsBank } from './data/questions';
import { Group, Question, GameScreenMode, ModalEventData } from './types';

export default function App() {
  const [screenMode, setScreenMode] = useState<GameScreenMode>('SETUP');
  const [groups, setGroups] = useState<Group[]>([]);
  const [questions, setQuestions] = useState<Question[]>(questionsBank);
  const [timeLimit, setTimeLimit] = useState<number>(45);
  const [modalData, setModalData] = useState<ModalEventData | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [gameHistory, setGameHistory] = useState<Array<{ question: Question; group: Group; isCorrect: boolean }>>([]);

  const handleStartGame = (configuredGroups: Group[], chosenTimeLimit: number, shuffleMode: boolean) => {
    let preparedQuestions = [...questionsBank];
    if (shuffleMode) {
      preparedQuestions = [...questionsBank].sort(() => Math.random() - 0.5);
    }
    setQuestions(preparedQuestions);
    setGroups(configuredGroups);
    setTimeLimit(chosenTimeLimit);
    setGameHistory([]);
    setScreenMode('PLAYING');
  };

  const handleFinishGame = (
    finalGroups: Group[],
    history: Array<{ question: Question; group: Group; isCorrect: boolean }>
  ) => {
    setGroups(finalGroups);
    setGameHistory(history);
    setScreenMode('FINISHED');
  };

  const handleRestart = () => {
    setScreenMode('SETUP');
  };

  const handleResetGamePrompt = () => {
    if (window.confirm('Apakah Anda yakin ingin menghentikan sesi permainan dan kembali ke menu awal? Seluruh poin saat ini akan direset.')) {
      setScreenMode('SETUP');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#10245e] via-[#060e28] to-[#020512] text-slate-100 flex flex-col font-sans">
      <Header
        onOpenRules={() => setIsRulesOpen(true)}
        onResetGame={handleResetGamePrompt}
        showReset={screenMode !== 'SETUP'}
      />

      <main className="flex-1 pb-12">
        {screenMode === 'SETUP' && (
          <SetupScreen onStartGame={handleStartGame} />
        )}

        {screenMode === 'PLAYING' && (
          <GameScreen
            questions={questions}
            groups={groups}
            timeLimit={timeLimit}
            onFinishGame={handleFinishGame}
            onTriggerEventModal={(event) => setModalData(event)}
          />
        )}

        {screenMode === 'FINISHED' && (
          <ResultScreen
            groups={groups}
            history={gameHistory}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Global Event Modal (Star Bonus / Eliminated / Lifelines) */}
      <EventModal
        data={modalData}
        onClose={() => setModalData(null)}
      />

      {/* Rules Reference Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Footer Note */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400">
        <p>
          Who Wants to Be a Millionaire · Matematika SD Kelas 6 · Kurikulum Merdeka (Pecahan & Desimal)
        </p>
      </footer>
    </div>
  );
}
