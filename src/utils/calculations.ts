export function calculateWordsCorrect(totalWords: number, errors: number): number {
  if (totalWords < 0 || errors < 0) return 0;
  return Math.max(0, totalWords - errors);
}

export function calculateWpm(wordsCorrect: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const seconds = elapsedMs / 1000;
  return (wordsCorrect / seconds) * 60;
}

export function calculateWpmDisplay(wordsCorrect: number, elapsedMs: number): number {
  return Math.round(calculateWpm(wordsCorrect, elapsedMs));
}

export function calculateAccuracy(totalWords: number, errors: number): number {
  if (totalWords <= 0) return 0;
  const clamped = Math.max(0, Math.min(errors, totalWords));
  return ((totalWords - clamped) / totalWords) * 100;
}

export function calculateSelfCorrectionRatio(
  errors: number,
  selfCorrections: number
): { ratio: string; numerator: number; denominator: number } | null {
  if (selfCorrections <= 0) return null;
  const numerator = errors + selfCorrections;
  const denominator = selfCorrections;
  const simplified = numerator / denominator;
  return {
    ratio: `1:${Math.round(simplified)}`,
    numerator,
    denominator,
  };
}

export function calculateRunningRecordAccuracy(totalWords: number, errors: number): number {
  return calculateAccuracy(totalWords, errors);
}

export function calculateGradePercentage(totalQuestions: number, incorrect: number): number {
  if (totalQuestions <= 0) return 0;
  const correct = Math.max(0, totalQuestions - incorrect);
  return (correct / totalQuestions) * 100;
}

export function formatTime(ms: number): string {
  if (ms < 0) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTimeWithTenths(ms: number): string {
  if (ms < 0) return '0:00.0';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds - minutes * 60;
  const secs = Math.floor(remainingSeconds);
  const tenths = Math.floor((remainingSeconds - secs) * 10);
  return `${minutes}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

export function validatePositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validatePositiveInteger(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}
