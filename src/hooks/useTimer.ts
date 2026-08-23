import { useEffect, useRef, useState, useCallback } from 'react';

export function useTimer(startTimestamp: number | null, isRunning: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const tick = useCallback(() => {
    if (startTimestamp) {
      setElapsed(Date.now() - startTimestamp);
    }
    frameRef.current = requestAnimationFrame(tick);
  }, [startTimestamp]);

  useEffect(() => {
    if (isRunning && startTimestamp) {
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, startTimestamp, tick]);

  useEffect(() => {
    if (!isRunning) {
      setElapsed(0);
    }
  }, [isRunning]);

  return elapsed;
}
