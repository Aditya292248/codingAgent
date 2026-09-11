import * as vscode from 'vscode';
import { DEFAULT_SESSION_CONFIG } from 'agent-core';
import { describeGraph, emptyGraph } from 'graph-core';
import { normalizeRepoPath } from 'shared';

/**
 * Development command: proves the extension activated and that the non-editor
 * packages are reachable from the bundle. It reports real state only — there
 * is no index to query yet, so it says so.
 */
function showStatus(): void {
  const folder = vscode.workspace.workspaceFolders?.[0];
  const graph = emptyGraph();
  const scope = folder
    ? normalizeRepoPath(vscode.workspace.asRelativePath(folder.uri, false))
    : '(no folder open)';

  void vscode.window.showInformationMessage(
    `Repository Graph active - workspace: ${scope}; ` +
      `index not built (${describeGraph(graph)}); ` +
      `model: ${DEFAULT_SESSION_CONFIG.model}`,
  );
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('repoGraph.showStatus', showStatus),
  );
}

export function deactivate(): void {
  // Nothing to tear down: all disposables are owned by the extension context.
}
