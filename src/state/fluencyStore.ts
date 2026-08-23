import { create } from 'zustand';
import { FluencySessionState } from '@/src/types/models';
import { calculateWordsCorrect, calculateWpm, calculateAccuracy } from '@/src/utils/calculations';
import { generateId } from '@/src/utils/uuid';

export interface ActiveErrorEvent {
  id: string;
  elapsedMilliseconds: number;
  timestamp: number;
}

interface FluencySession {
  sessionState: FluencySessionState;
  studentId: string | null;
  studentName: string;
  passageId: string | null;
  passageTitle: string;
  totalWords: number;
  startTimestamp: number | null;
  stopTimestamp: number | null;
  elapsedMs: number;
  errorEvents: ActiveErrorEvent[];
  editedTotalWords: number | null;
  editedElapsedMs: number | null;
  editedErrorCount: number | null;
  calculatedWordsCorrect: number | null;
  calculatedWpm: number | null;
  calculatedAccuracy: number | null;
}

interface FluencyStore extends FluencySession {
  setStudent: (id: string | null, name: string) => void;
  setPassage: (id: string | null, title: string, wordCount: number) => void;
  setTotalWords: (count: number) => void;
  startReading: () => void;
  addError: () => ActiveErrorEvent;
  undoLastError: () => void;
  stopReading: () => void;
  setEditedTotalWords: (value: number) => void;
  setEditedElapsedMs: (value: number) => void;
  setEditedErrorCount: (value: number) => void;
  calculate: () => void;
  getEffectiveTotalWords: () => number;
  getEffectiveElapsedMs: () => number;
  getEffectiveErrorCount: () => number;
  reset: () => void;
  resetForRetry: () => void;
}

const initialState: FluencySession = {
  sessionState: 'idle',
  studentId: null,
  studentName: '',
  passageId: null,
  passageTitle: '',
  totalWords: 0,
  startTimestamp: null,
  stopTimestamp: null,
  elapsedMs: 0,
  errorEvents: [],
  editedTotalWords: null,
  editedElapsedMs: null,
  editedErrorCount: null,
  calculatedWordsCorrect: null,
  calculatedWpm: null,
  calculatedAccuracy: null,
};

export const useFluencyStore = create<FluencyStore>((set, get) => ({
  ...initialState,

  setStudent: (id, name) => set({ studentId: id, studentName: name }),

  setPassage: (id, title, wordCount) =>
    set({ passageId: id, passageTitle: title, totalWords: wordCount }),

  setTotalWords: (count) => set({ totalWords: count }),

  startReading: () => {
    const now = Date.now();
    set({
      sessionState: 'running',
      startTimestamp: now,
      stopTimestamp: null,
      elapsedMs: 0,
      errorEvents: [],
      editedTotalWords: null,
      editedElapsedMs: null,
      editedErrorCount: null,
      calculatedWordsCorrect: null,
      calculatedWpm: null,
      calculatedAccuracy: null,
    });
  },

  addError: () => {
    const state = get();
    if (state.sessionState !== 'running' || !state.startTimestamp) {
      return { id: '', elapsedMilliseconds: 0, timestamp: 0 };
    }
    const now = Date.now();
    const elapsed = now - state.startTimestamp;
    const event: ActiveErrorEvent = {
      id: generateId(),
      elapsedMilliseconds: elapsed,
      timestamp: now,
    };
    set({ errorEvents: [...state.errorEvents, event] });
    return event;
  },

  undoLastError: () => {
    const state = get();
    if (state.errorEvents.length === 0) return;
    set({ errorEvents: state.errorEvents.slice(0, -1) });
  },

  stopReading: () => {
    const state = get();
    if (state.sessionState !== 'running' || !state.startTimestamp) return;
    const now = Date.now();
    const elapsed = now - state.startTimestamp;
    set({
      sessionState: 'review',
      stopTimestamp: now,
      elapsedMs: elapsed,
    });
  },

  setEditedTotalWords: (value) => {
    set({ editedTotalWords: value, calculatedWordsCorrect: null, calculatedWpm: null, calculatedAccuracy: null });
  },

  setEditedElapsedMs: (value) => {
    set({ editedElapsedMs: value, calculatedWordsCorrect: null, calculatedWpm: null, calculatedAccuracy: null });
  },

  setEditedErrorCount: (value) => {
    set({ editedErrorCount: value, calculatedWordsCorrect: null, calculatedWpm: null, calculatedAccuracy: null });
  },

  calculate: () => {
    const state = get();
    const tw = state.editedTotalWords ?? state.totalWords;
    const elapsed = state.editedElapsedMs ?? state.elapsedMs;
    const errors = state.editedErrorCount ?? state.errorEvents.length;

    const wordsCorrect = calculateWordsCorrect(tw, errors);
    const wpm = calculateWpm(wordsCorrect, elapsed);
    const accuracy = calculateAccuracy(tw, errors);

    set({
      sessionState: 'calculated',
      calculatedWordsCorrect: wordsCorrect,
      calculatedWpm: wpm,
      calculatedAccuracy: accuracy,
    });
  },

  getEffectiveTotalWords: () => {
    const state = get();
    return state.editedTotalWords ?? state.totalWords;
  },

  getEffectiveElapsedMs: () => {
    const state = get();
    return state.editedElapsedMs ?? state.elapsedMs;
  },

  getEffectiveErrorCount: () => {
    const state = get();
    return state.editedErrorCount ?? state.errorEvents.length;
  },

  reset: () => set(initialState),

  resetForRetry: () => {
    const state = get();
    set({
      ...initialState,
      studentId: state.studentId,
      studentName: state.studentName,
      passageId: state.passageId,
      passageTitle: state.passageTitle,
      totalWords: state.editedTotalWords ?? state.totalWords,
    });
  },
}));
