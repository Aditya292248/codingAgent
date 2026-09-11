import { addNumbers } from './math';

/** Calls `addNumbers` from another file, producing a cross-file `calls` edge. */
export function totalScore(scores: number[]): number {
  let total = 0;
  for (const score of scores) {
    total = addNumbers(total, score);
  }
  return total;
}
