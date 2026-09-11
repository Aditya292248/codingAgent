import type { RequestId, ToolResult } from 'shared';

/**
 * The public surface of the agent runtime.
 *
 * Model transport and the agent loop arrive in a later change. This package
 * currently owns only the types that describe that surface. Nothing here
 * reads credentials or performs network access.
 */

/** A single turn in a conversation with the model. */
export interface AgentMessage {
  readonly role: 'user' | 'assistant';
  readonly text: string;
}

/** A tool the agent may invoke, as advertised to the model. */
export interface ToolDescriptor {
  /** Unique, stable tool name. */
  readonly name: string;
  /** One-line description shown to the model. */
  readonly description: string;
}

/** Executes a named tool on behalf of the agent. */
export interface ToolRunner {
  readonly descriptors: readonly ToolDescriptor[];
  run(
    requestId: RequestId,
    name: string,
    input: unknown,
  ): Promise<ToolResult<unknown>>;
}

/** Configuration for an agent session, resolved by the host. */
export interface AgentSessionConfig {
  /** Model identifier, e.g. `claude-sonnet-5`. */
  readonly model: string;
  /** Upper bound on agent iterations before the loop gives up. */
  readonly maxTurns: number;
}

/** Defaults used when the host supplies no overrides. */
export const DEFAULT_SESSION_CONFIG: AgentSessionConfig = {
  model: 'claude-sonnet-5',
  maxTurns: 16,
};
