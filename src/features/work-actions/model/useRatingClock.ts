import { useEffect, useRef, useState } from "react";
import type { WorkRating } from "@/entities/work";

// Seconds left in the rating window. It counts down from the server's own
// `remaining_seconds` (never from the device clock vs. a deadline) and asks for a
// refetch when it reaches zero so the server decides what happens next.
export function useRatingClock(rating: WorkRating | null, fetchedAt: number, onZero: () => void): number {
  const live = !!rating && rating.available && !rating.submitted && rating.remainingSeconds > 0;
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(0);
  const cb = useRef(onZero);
  useEffect(() => {
    cb.current = onZero;
  });
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [live]);
  const left = live && rating ? Math.max(0, rating.remainingSeconds - Math.floor((Math.max(now, fetchedAt) - fetchedAt) / 1000)) : 0;
  useEffect(() => {
    if (live && left === 0 && fired.current !== fetchedAt) {
      fired.current = fetchedAt;
      cb.current();
    }
  }, [live, left, fetchedAt]);
  return left;
}
