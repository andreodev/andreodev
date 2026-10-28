import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = new URL('../', import.meta.url);
const readme = await readFile(new URL('README.md', root), 'utf8');
// Prévia do Markdown local; não recebe conteúdo de visitantes.
const content = marked.parse(readme).replaceAll('./assets/', '../assets/');
const html = `<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Andreo Henrique — prévia do README</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 48px 24px; background: #010409; color: #e6edf3; font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  main { max-width: 914px; margin: auto; padding: 32px; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; }
  img { max-width: 100%; height: auto; vertical-align: middle; }
  img[height="40"] { height: 40px; width: auto; margin: 3px; }
  p { margin: 0 0 16px; }
  h3 { margin: 24px 0 16px; font-size: 20px; line-height: 1.25; font-weight: 600; }
  a { color: #c4f563; text-decoration: none; }
  a:hover { text-decoration: underline; }
  strong { font-weight: 600; }
  sub { font-size: 12px; color: #a2adb9; }
  @media (max-width: 600px) { body { padding: 12px; } main { padding: 16px; } h3 { font-size: 18px; } }
</style>
<main>${content}</main>
</html>`;
await mkdir(new URL('preview/', root), { recursive: true });
await writeFile(new URL('preview/index.html', root), html);
console.log(fileURLToPath(new URL('preview/index.html', root)));
