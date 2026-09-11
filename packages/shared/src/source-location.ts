/**
 * Source coordinate conventions used by every package in this workspace.
 *
 * Positions
 *  - `line` is ZERO-BASED: the first line of a file is line 0.
 *  - `column` is ZERO-BASED and counts UTF-16 code units, not glyphs, so an
 *    astral-plane character advances the column by 2. This matches the VS Code
 *    `Position` model, so no conversion is needed at the editor boundary.
 *
 * Ranges
 *  - `start` is INCLUSIVE and `end` is EXCLUSIVE, i.e. `[start, end)`.
 *  - An empty range (a caret position) has `start` deep-equal to `end`.
 *  - `end` may sit at the position one past the final character of a line.
 *
 * Paths
 *  - `path` is always REPOSITORY-RELATIVE: relative to the repository root,
 *    never absolute and never prefixed with `./`.
 *  - Separators are always forward slashes, including on Windows.
 *  - Paths are NOT case-folded; they are compared byte-for-byte, so callers on
 *    case-insensitive file systems must normalize before comparing.
 *
 * Use {@link normalizeRepoPath} to produce a value that satisfies these rules.
 */

/** A zero-based position in a source file. */
export interface Position {
  /** Zero-based line index. */
  readonly line: number;
  /** Zero-based column index, in UTF-16 code units. */
  readonly column: number;
}

/** A half-open `[start, end)` span within a single source file. */
export interface SourceRange {
  readonly start: Position;
  /** Exclusive end of the span. */
  readonly end: Position;
}

/** A span of source code, identified by repository-relative path. */
export interface SourceLocation {
  /** Repository-relative, forward-slash separated path. */
  readonly path: string;
  readonly range: SourceRange;
}

/**
 * Normalizes a path into the repository-relative form described above.
 *
 * Accepts backslash separators, redundant separators, and a leading `./`.
 * It does not resolve `..` segments or touch the file system; callers are
 * expected to pass a path already known to be inside the repository.
 */
export function normalizeRepoPath(rawPath: string): string {
  return rawPath
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '');
}

/** True when `position` falls inside the half-open `range`. */
export function rangeContains(range: SourceRange, position: Position): boolean {
  return (
    comparePositions(range.start, position) <= 0 &&
    comparePositions(position, range.end) < 0
  );
}

/** Orders two positions: negative if `a` precedes `b`, zero when equal. */
export function comparePositions(a: Position, b: Position): number {
  return a.line !== b.line ? a.line - b.line : a.column - b.column;
}
