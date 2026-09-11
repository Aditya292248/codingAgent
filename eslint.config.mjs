import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** Packages are layered; these rules keep the layering honest. */
const noVscode = {
  name: 'vscode',
  message:
    'This package must stay editor-agnostic; keep vscode usage in apps/vscode-extension.',
};
const noAgentCore = {
  name: 'agent-core',
  message: 'graph-core must not depend on agent-core.',
};

export default tseslint.config(
  { ignores: ['**/lib/**', '**/dist/**', 'fixtures/**', '**/*.mjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: [
          './packages/*/tsconfig.json',
          './apps/vscode-extension/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['packages/shared/**/*.ts', 'packages/agent-core/**/*.ts', 'packages/graph-cli/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: [noVscode] }],
    },
  },
  {
    files: ['packages/graph-core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { paths: [noVscode, noAgentCore] }],
    },
  },
);
