import { addNumbers } from './math';

/** A class with a single method, for node-kind coverage. */
export class Accumulator {
  private total = 0;

  /** Method that calls an imported function. */
  add(value: number): number {
    this.total = addNumbers(this.total, value);
    return this.total;
  }
}
