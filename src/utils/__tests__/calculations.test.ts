import {
  calculateWordsCorrect,
  calculateWpm,
  calculateWpmDisplay,
  calculateAccuracy,
  calculateSelfCorrectionRatio,
  calculateRunningRecordAccuracy,
  calculateGradePercentage,
  formatTime,
  formatTimeWithTenths,
  validatePositiveNumber,
  validatePositiveInteger,
} from '../calculations';

describe('calculateWordsCorrect', () => {
  it('subtracts errors from total words', () => {
    expect(calculateWordsCorrect(74, 3)).toBe(71);
  });

  it('returns 0 when errors equal total words', () => {
    expect(calculateWordsCorrect(50, 50)).toBe(0);
  });

  it('returns 0 when errors exceed total words', () => {
    expect(calculateWordsCorrect(10, 15)).toBe(0);
  });

  it('returns total when zero errors', () => {
    expect(calculateWordsCorrect(100, 0)).toBe(100);
  });

  it('handles negative inputs safely', () => {
    expect(calculateWordsCorrect(-5, 3)).toBe(0);
    expect(calculateWordsCorrect(50, -2)).toBe(0);
  });
});

describe('calculateWpm', () => {
  it('calculates correct WPM for spec example: 71 correct, 138s', () => {
    const wpm = calculateWpm(71, 138000);
    expect(wpm).toBeCloseTo(30.87, 1);
  });

  it('calculates 100 WPM for 100 words in 60 seconds', () => {
    expect(calculateWpm(100, 60000)).toBe(100);
  });

  it('calculates 100 WPM for 50 words in 30 seconds', () => {
    expect(calculateWpm(50, 30000)).toBe(100);
  });

  it('returns 0 for zero elapsed time', () => {
    expect(calculateWpm(50, 0)).toBe(0);
  });

  it('returns 0 for negative elapsed time', () => {
    expect(calculateWpm(50, -1000)).toBe(0);
  });
});

describe('calculateWpmDisplay', () => {
  it('rounds to nearest whole number', () => {
    expect(calculateWpmDisplay(71, 138000)).toBe(31);
  });

  it('rounds 100 WPM correctly', () => {
    expect(calculateWpmDisplay(100, 60000)).toBe(100);
  });
});

describe('calculateAccuracy', () => {
  it('calculates accuracy for spec example', () => {
    const acc = calculateAccuracy(74, 3);
    expect(acc).toBeCloseTo(95.95, 1);
  });

  it('returns 100 for zero errors', () => {
    expect(calculateAccuracy(100, 0)).toBe(100);
  });

  it('returns 0 for zero total words', () => {
    expect(calculateAccuracy(0, 5)).toBe(0);
  });

  it('clamps errors to total words', () => {
    const acc = calculateAccuracy(10, 15);
    expect(acc).toBe(0);
  });
});

describe('calculateSelfCorrectionRatio', () => {
  it('calculates SC ratio for spec example: 6 errors, 3 SC', () => {
    const result = calculateSelfCorrectionRatio(6, 3);
    expect(result).not.toBeNull();
    expect(result!.ratio).toBe('1:3');
    expect(result!.numerator).toBe(9);
    expect(result!.denominator).toBe(3);
  });

  it('returns null for zero self-corrections', () => {
    expect(calculateSelfCorrectionRatio(5, 0)).toBeNull();
  });

  it('returns null for negative self-corrections', () => {
    expect(calculateSelfCorrectionRatio(5, -1)).toBeNull();
  });
});

describe('calculateRunningRecordAccuracy', () => {
  it('calculates accuracy for 100 words, 6 errors', () => {
    const acc = calculateRunningRecordAccuracy(100, 6);
    expect(acc).toBe(94);
  });
});

describe('calculateGradePercentage', () => {
  it('calculates grade for 20 questions, 3 incorrect', () => {
    expect(calculateGradePercentage(20, 3)).toBe(85);
  });

  it('returns 100 for zero incorrect', () => {
    expect(calculateGradePercentage(20, 0)).toBe(100);
  });

  it('returns 0 for all incorrect', () => {
    expect(calculateGradePercentage(20, 20)).toBe(0);
  });

  it('returns 0 for zero total questions', () => {
    expect(calculateGradePercentage(0, 5)).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats zero', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds', () => {
    expect(formatTime(5000)).toBe('0:05');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(138000)).toBe('2:18');
  });

  it('formats over 10 minutes', () => {
    expect(formatTime(734000)).toBe('12:14');
  });

  it('handles negative gracefully', () => {
    expect(formatTime(-1000)).toBe('0:00');
  });
});

describe('formatTimeWithTenths', () => {
  it('formats with tenths', () => {
    expect(formatTimeWithTenths(88500)).toBe('1:28.5');
  });
});

describe('validation', () => {
  it('validates positive numbers', () => {
    expect(validatePositiveNumber(5)).toBe(true);
    expect(validatePositiveNumber(0)).toBe(true);
    expect(validatePositiveNumber(-1)).toBe(false);
    expect(validatePositiveNumber(NaN)).toBe(false);
    expect(validatePositiveNumber(Infinity)).toBe(false);
  });

  it('validates positive integers', () => {
    expect(validatePositiveInteger(5)).toBe(true);
    expect(validatePositiveInteger(0)).toBe(true);
    expect(validatePositiveInteger(5.5)).toBe(false);
    expect(validatePositiveInteger(-1)).toBe(false);
  });
});
