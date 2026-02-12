const CURRENT_KEY = 'as16.current';

export type AnswerValue = 1 | 2 | 3 | 4 | 5;

export type SessionCurrent = {
  displayName: string;
  mode: 20 | 100;
  answers: Record<string, AnswerValue>;
  tieAnswers: Record<string, AnswerValue>;
  currentIndex: number;
  tieMode?: boolean;
  tieOrder?: string[];
  tieIndex?: number;
  tieStep?: number;
  createdAt: string;
};

export function saveCurrent(current: SessionCurrent): void {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
}

export function loadCurrent(): SessionCurrent | null {
  const raw = localStorage.getItem(CURRENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionCurrent;
  } catch {
    return null;
  }
}

export function clearCurrent(): void {
  localStorage.removeItem(CURRENT_KEY);
}
