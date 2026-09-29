export interface Question {
  id: number;
  q: string;
  a: string;
  o: string[];
  hint?: string;
  explanation?: string;
}

export interface GroupLifelines {
  fifty: boolean;
  skip: boolean;
  ask: boolean;
  poll: boolean;
}

export interface Group {
  id: number;
  name: string;
  members: string[];
  points: number;
  stars: number;
  correct: number;
  wrong: number;
  correctStreak: number;
  wrongStreak: number;
  eliminated: boolean;
  lifelines: GroupLifelines;
}

export type GameScreenMode = 'SETUP' | 'PLAYING' | 'FINISHED';

export interface ModalEventData {
  type: 'STAR' | 'ELIMINATED' | 'TEACHER_HINT' | 'POLL_RESULT' | 'INFO';
  title: string;
  content: string;
  buttonText: string;
  starsEarned?: number;
  groupName?: string;
  pollData?: { label: string; percent: number; isAnswer: boolean }[];
  onConfirm?: () => void;
}
