#!/usr/bin/env node
import { runCli } from './index';

const outcome = runCli(process.argv.slice(2));

if (outcome.stdout !== '') {
  process.stdout.write(outcome.stdout);
}
if (outcome.stderr !== '') {
  process.stderr.write(outcome.stderr);
}

process.exitCode = outcome.exitCode;
