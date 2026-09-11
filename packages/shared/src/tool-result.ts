/** Correlates a tool request with its result. Unique per request. */
export type RequestId = string;

/** A tool call that produced a value. */
export interface ToolSuccess<T> {
  readonly ok: true;
  readonly requestId: RequestId;
  readonly value: T;
}

/** A tool call that failed. `code` is stable; `message` is for humans. */
export interface ToolFailure {
  readonly ok: false;
  readonly requestId: RequestId;
  readonly error: ToolError;
}

export interface ToolError {
  /** Stable, machine-readable reason. */
  readonly code: ToolErrorCode;
  /** Human-readable explanation, safe to show to the user. */
  readonly message: string;
  /** Optional structured context; must not contain secrets. */
  readonly details?: Readonly<Record<string, unknown>>;
}

export type ToolErrorCode =
  | 'invalid-request'
  | 'not-found'
  | 'unsupported'
  | 'cancelled'
  | 'internal';

/**
 * Result of a tool invocation. Discriminate on `ok` before reading `value`
 * or `error`; tools report failure through this type rather than by throwing.
 */
export type ToolResult<T> = ToolSuccess<T> | ToolFailure;

export function toolSuccess<T>(requestId: RequestId, value: T): ToolSuccess<T> {
  return { ok: true, requestId, value };
}

export function toolFailure(requestId: RequestId, error: ToolError): ToolFailure {
  return { ok: false, requestId, error };
}

/** Type guard narrowing a result to its success branch. */
export function isToolSuccess<T>(result: ToolResult<T>): result is ToolSuccess<T> {
  return result.ok;
}
