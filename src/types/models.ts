export interface Student {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface Passage {
  id: string;
  title: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingAttempt {
  id: string;
  studentId: string | null;
  passageId: string | null;
  passageTitleSnapshot: string;
  totalWords: number;
  elapsedMilliseconds: number;
  errorCount: number;
  wordsCorrect: number;
  wpm: number;
  accuracy: number;
  startedAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorEvent {
  id: string;
  readingAttemptId: string;
  elapsedMilliseconds: number;
  createdAt: string;
}

export type FluencySessionState =
  | 'idle'
  | 'ready'
  | 'running'
  | 'stopped'
  | 'review'
  | 'calculated'
  | 'saved';
