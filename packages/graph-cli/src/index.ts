import { GRAPH_FORMAT_VERSION } from 'graph-core';

/** What the CLI decided to do for a given argument list. */
export interface CliOutcome {
  /** Process exit code: 0 for success. */
  readonly exitCode: number;
  /** Text for stdout. */
  readonly stdout: string;
  /** Text for stderr. */
  readonly stderr: string;
}

export const CLI_NAME = 'graph-cli';

export const HELP_TEXT = `${CLI_NAME} - query a local repository graph

Usage:
  ${CLI_NAME} <command> [options]

Commands:
  (none yet)  Indexing and query commands land in a later change.

Options:
  -h, --help     Print this message and exit.
  -v, --version  Print the graph index format version and exit.
`;

/**
 * Pure argument handling, so the behaviour can be exercised without spawning
 * a process. `argv` excludes the node executable and script path.
 */
export function runCli(argv: readonly string[]): CliOutcome {
  if (argv.length === 0 || argv.includes('-h') || argv.includes('--help')) {
    return { exitCode: 0, stdout: HELP_TEXT, stderr: '' };
  }

  if (argv.includes('-v') || argv.includes('--version')) {
    return {
      exitCode: 0,
      stdout: `graph index format version ${GRAPH_FORMAT_VERSION}\n`,
      stderr: '',
    };
  }

  const command = argv[0] ?? '';
  return {
    exitCode: 2,
    stdout: '',
    stderr: `${CLI_NAME}: unknown command '${command}'\nRun '${CLI_NAME} --help' for usage.\n`,
  };
}
