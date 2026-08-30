const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node16',
    outfile: 'dist/extension.js',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    external: ['vscode'],
    logLevel: 'info',
  });

  if (watch) {
    await ctx.watch();
    console.log('[esbuild] watching for changes...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
