import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import config from '../profile.config.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const cache = path.join(root, '.cache');
const raw = 'https://raw.githubusercontent.com/google/fonts/main/ofl';
const headers = { 'User-Agent': 'andreodev-profile/1.0 (https://github.com/andreodev)' };
let cachedSources = new Map();

async function request(url, binary = true) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > 20 * 1024 * 1024) throw new Error(`Asset acima de 20 MB: ${url}`);
  return binary ? data : data.toString('utf8');
}

async function download(url, destination, force, kind) {
  const file = path.relative(cache, destination).split(path.sep).join('/');
  let data;
  if (!force && cachedSources.get(file)?.url === url) {
    try { data = await readFile(destination); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (data && createHash('sha256').update(data).digest('hex') !== cachedSources.get(file).sha256) data = undefined;
  }
  if (!data) {
    data = await request(url);
    if (kind === 'gif' && !/^GIF8[79]a/.test(data.toString('ascii', 0, 6))) {
      throw new Error(`A fonte não retornou GIF: ${url}`);
    }
    if (kind === 'svg' && (!data.toString().includes('<svg') || /<script|<foreignObject/i.test(data.toString()))) {
      throw new Error(`SVG inválido: ${url}`);
    }
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, data);
    console.log(`Baixado: ${path.relative(root, destination)}`);
  }
  return { file, url, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') };
}

export async function fetchAssets({ force = false } = {}) {
  await mkdir(cache, { recursive: true });
  const sources = [];
  let mediaUrl;
  try {
    const previous = JSON.parse(await readFile(path.join(cache, 'sources.json'), 'utf8'));
    cachedSources = new Map(previous.map(source => [source.file, source]));
    if (!force) mediaUrl = previous.find(source => source.kind === 'animation'
      && source.page === config.media.page && new URL(source.url).pathname.endsWith(`/${config.media.filename}`))?.url;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }

  if (!mediaUrl) {
    // Descobre o arquivo na página original, em vez de depender de um hotlink de GIF.
    const page = await request(config.media.page, false);
    const gifs = [...page.matchAll(/(?:href|src)=["']([^"']+\.gif)["']/gi)]
      .map(match => new URL(match[1], config.media.page).href);
    mediaUrl = gifs.find(url => new URL(url).pathname.endsWith(`/${config.media.filename}`));
    if (!mediaUrl) throw new Error(`GIF ${config.media.filename} não encontrado em ${config.media.page}`);
    console.log(`Pesquisa NASA: ${new Set(gifs).size} GIFs encontrados; selecionado ${config.media.filename}`);
  }
  sources.push({ kind: 'animation', credit: config.media.credit, page: config.media.page,
    ...await download(mediaUrl, path.join(cache, 'black-hole.gif'), force, 'gif') });

  const fonts = [
    ['space-grotesk.ttf', `${raw}/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf`],
    ['plex-mono.ttf', `${raw}/ibmplexmono/IBMPlexMono-Regular.ttf`],
    ['space-grotesk-OFL.txt', `${raw}/spacegrotesk/OFL.txt`],
    ['plex-mono-OFL.txt', `${raw}/ibmplexmono/OFL.txt`],
  ];
  // Downloads independentes: fontes, licenças e ícones.
  const jobs = [
    ...fonts.map(async ([name, url]) => ({ kind: 'font', name,
      ...await download(url, path.join(cache, 'fonts', name), force) })),
    ...config.stack.map(async ({ slug }) => ({ kind: 'icon', name: slug,
      ...await download(`https://cdn.jsdelivr.net/npm/simple-icons@${config.iconVersion}/icons/${slug}.svg`,
        path.join(cache, 'icons', `${slug}.svg`), force, 'svg') })),
    (async () => ({ kind: 'license', name: 'Simple Icons',
      ...await download(`https://cdn.jsdelivr.net/npm/simple-icons@${config.iconVersion}/LICENSE.md`,
        path.join(cache, 'simple-icons-LICENSE.md'), force) }))(),
  ];
  const results = await Promise.allSettled(jobs);
  const failures = results.filter(result => result.status === 'rejected');
  if (failures.length) throw new AggregateError(failures.map(result => result.reason), 'Falha ao buscar assets');
  sources.push(...results.map(result => result.value));
  await writeFile(path.join(cache, 'sources.json'), `${JSON.stringify(sources, null, 2)}\n`);
  console.log(`${sources.length} fontes verificadas e disponíveis no cache.`);
  return sources;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await fetchAssets({ force: process.argv.includes('--refresh') });
}
