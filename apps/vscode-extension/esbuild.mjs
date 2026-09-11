import { build, context } from 'esbuild';

/**
 * Bundles the extension into a single CommonJS file. `vscode` is provided by
 * the editor at runtime and must never be bundled.
 */
const options = {
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['vscode'],
  sourcemap: true,
  logLevel: 'info',
  minify: process.env.NODE_ENV === 'production',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
} else {
  await build(options);
}
