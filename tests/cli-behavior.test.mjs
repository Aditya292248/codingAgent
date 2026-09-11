// Exercises the CLI's pure argument handling directly.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { runCli, HELP_TEXT } = require('graph-cli');

test('no arguments prints help and succeeds', () => {
  const outcome = runCli([]);
  assert.equal(outcome.exitCode, 0);
  assert.equal(outcome.stdout, HELP_TEXT);
  assert.equal(outcome.stderr, '');
});

test('--version reports the graph index format version', () => {
  const outcome = runCli(['--version']);
  assert.equal(outcome.exitCode, 0);
  assert.match(outcome.stdout, /graph index format version \d+/);
});

test('unknown commands report on stderr, not stdout', () => {
  const outcome = runCli(['index']);
  assert.equal(outcome.exitCode, 2);
  assert.equal(outcome.stdout, '');
  assert.match(outcome.stderr, /unknown command 'index'/);
});
