/**
 * An unrelated `addNumbers` in a different scope. It shares a name with the
 * export in `math.ts` but is a distinct declaration, so name-based resolution
 * must not conflate the two.
 */
function addNumbers(values: readonly string[]): string {
  return values.join('+');
}

export function describeValues(values: readonly string[]): string {
  return addNumbers(values);
}
