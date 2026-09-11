// Smoke checks against BUILT output: these fail if package exports, the
// module strategy, or cross-package resolution regress.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('shared exports runtime helpers that follow the path convention', () => {
  const shared = require('shared');
  assert.equal(shared.normalizeRepoPath('.\\src\\a//b.ts'), 'src/a/b.ts');
  assert.equal(shared.normalizeRepoPath('/src/a.ts'), 'src/a.ts');
});

test('shared range helpers treat ranges as half-open and zero-based', () => {
  const { rangeContains, comparePositions } = require('shared');
  const range = { start: { line: 0, column: 0 }, end: { line: 0, column: 3 } };
  assert.equal(rangeContains(range, { line: 0, column: 0 }), true);
  assert.equal(rangeContains(range, { line: 0, column: 2 }), true);
  // The exclusive end is outside the range.
  assert.equal(rangeContains(range, { line: 0, column: 3 }), false);
  assert.ok(comparePositions({ line: 1, column: 0 }, { line: 2, column: 0 }) < 0);
});

test('tool results discriminate on ok and carry the request id', () => {
  const { toolSuccess, toolFailure, isToolSuccess } = require('shared');
  const ok = toolSuccess('req-1', 42);
  assert.equal(isToolSuccess(ok), true);
  assert.equal(ok.requestId, 'req-1');
  assert.equal(ok.value, 42);

  const bad = toolFailure('req-2', { code: 'not-found', message: 'missing' });
  assert.equal(isToolSuccess(bad), false);
  assert.equal(bad.error.code, 'not-found');
});

test('graph-core resolves shared from built output', () => {
  const graphCore = require('graph-core');
  assert.equal(graphCore.describeGraph(graphCore.emptyGraph()), '0 nodes, 0 edges');
  assert.equal(typeof graphCore.GRAPH_FORMAT_VERSION, 'number');
});

test('agent-core exports a session default and needs no credentials', () => {
  const agentCore = require('agent-core');
  assert.equal(typeof agentCore.DEFAULT_SESSION_CONFIG.model, 'string');
  assert.ok(agentCore.DEFAULT_SESSION_CONFIG.maxTurns > 0);
});

test('every package publishes type declarations', async () => {
  for (const pkg of ['shared', 'graph-core', 'agent-core', 'graph-cli']) {
    const types = path.join(repoRoot, 'packages', pkg, 'lib', 'index.d.ts');
    const contents = await readFile(types, 'utf8');
    assert.ok(contents.length > 0, `${pkg} has empty declarations`);
  }
});

test('graph-cli --help exits successfully and prints usage', async () => {
  const bin = path.join(repoRoot, 'packages', 'graph-cli', 'lib', 'bin.js');
  const { stdout } = await execFileAsync(process.execPath, [bin, '--help']);
  assert.match(stdout, /Usage:/);
  assert.match(stdout, /graph-cli/);
});

test('graph-cli rejects an unknown command with a non-zero exit code', async () => {
  const bin = path.join(repoRoot, 'packages', 'graph-cli', 'lib', 'bin.js');
  await assert.rejects(
    () => execFileAsync(process.execPath, [bin, 'nope']),
    (error) => {
      assert.equal(error.code, 2);
      assert.match(error.stderr, /unknown command 'nope'/);
      return true;
    },
  );
});

test('the extension bundle is loadable CJS and keeps vscode external', async () => {
  const bundlePath = path.join(repoRoot, 'apps', 'vscode-extension', 'dist', 'extension.js');
  const bundle = await readFile(bundlePath, 'utf8');
  assert.match(bundle, /require\("vscode"\)/);

  // Stub the editor API so the bundle can be loaded outside VS Code, then
  // check that activate() registers the development command.
  const Module = require('node:module');
  const registered = [];
  const vscodeStub = {
    window: { showInformationMessage() {} },
    workspace: { workspaceFolders: undefined, asRelativePath: (p) => String(p) },
    commands: {
      registerCommand(id, handler) {
        registered.push(id);
        return { dispose() {} };
      },
    },
  };
  const originalLoad = Module._load;
  Module._load = (request, parent, isMain) =>
    request === 'vscode' ? vscodeStub : originalLoad(request, parent, isMain);
  try {
    const extension = require(bundlePath);
    const subscriptions = [];
    extension.activate({ subscriptions });
    assert.deepEqual(registered, ['repoGraph.showStatus']);
    assert.equal(subscriptions.length, 1);
    extension.deactivate();
  } finally {
    Module._load = originalLoad;
  }
});

test('declared commands are all registered on activation', async () => {
  const manifest = JSON.parse(
    await readFile(path.join(repoRoot, 'apps', 'vscode-extension', 'package.json'), 'utf8'),
  );
  const declared = manifest.contributes.commands.map((c) => c.command);
  assert.deepEqual(declared, ['repoGraph.showStatus']);
  assert.equal(manifest.main, './dist/extension.js');
});
