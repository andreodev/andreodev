import { mkdir, readFile, writeFile, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import * as fontkit from 'fontkit';
import gifenc from 'gifenc';
import config from '../profile.config.mjs';
import { fetchAssets, root, cache } from './fetch-assets.mjs';

const { GIFEncoder, quantize, applyPalette } = gifenc;
const assets = path.join(root, 'assets');
const c = config.colors;
const xml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
})[char]);
await fetchAssets({ force: process.argv.includes('--refresh') });
await mkdir(assets, { recursive: true });
const grotesk = fontkit.openSync(path.join(cache, 'fonts/space-grotesk.ttf'));
const mono = fontkit.openSync(path.join(cache, 'fonts/plex-mono.ttf'));
const bold = grotesk.getVariation({ wght: 700 });
const medium = grotesk.getVariation({ wght: 500 });

// Converte a tipografia em curvas: o GitHub não precisa carregar fontes externas.
function text(value, x, y, size, { font = medium, color = c.text, spacing = 0 } = {}) {
  const run = font.layout(value);
  const scale = size / font.unitsPerEm;
  let cursor = 0;
  const paths = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const markup = `<path d="${glyph.path.toSVG()}" transform="translate(${cursor + position.xOffset * scale} ${-position.yOffset * scale}) scale(${scale} ${-scale})"/>`;
    cursor += position.xAdvance * scale + spacing;
    return markup;
  }).join('');
  return `<g aria-label="${xml(value)}" fill="${color}" transform="translate(${x} ${y})">${paths}</g>`;
}

function svg(width, height, content, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${xml(title)}</title>${content}</svg>`;
}
async function saveSVG(name, width, height, content, title) {
  const result = svg(width, height, content, title);
  await writeFile(path.join(assets, `${name}.svg`), `${result}\n`);
  return result;
}
function arrow(x, y, color = c.accent) {
  return `<path d="M${x} ${y + 14}l14-14m-13 0h13v13" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
}

async function buildHero() {
  const { width, height, frames, delay } = config.animation;
  const source = await readFile(path.join(cache, 'black-hole.gif'));
  const metadata = await sharp(source).metadata();
  const backdrop = svg(width, height, `
    <rect width="${width}" height="${height}" rx="16" fill="${c.background}"/>
    <path d="M582 76v280M40 354h1120" stroke="${c.border}" stroke-opacity=".55"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${626 + i * 72} 80v260" stroke="${c.border}" stroke-opacity=".18"/>`).join('')}
    ${Array.from({ length: 5 }, (_, i) => `<path d="M610 ${92 + i * 54}h552" stroke="${c.border}" stroke-opacity=".18"/>`).join('')}
    <circle cx="888" cy="208" r="138" fill="none" stroke="${c.border}" stroke-opacity=".75" stroke-dasharray="2 9"/>
    <circle cx="888" cy="208" r="104" fill="none" stroke="${c.border}" stroke-opacity=".35"/>
  `, config.name);
  const overlay = svg(width, height, `
    <rect x="1" y="1" width="1198" height="428" rx="15" fill="none" stroke="${c.border}"/>
    <path d="M40 38h16m-8-8v16m-6-14 12 12m-12 0 12-12" stroke="${c.accent}" stroke-width="1.7"/>
    ${text(`${config.handle.toUpperCase()} / SOFTWARE ENGINEER`, 72, 43, 12, { font: mono, color: c.muted, spacing: 1 })}
    <circle cx="995" cy="38" r="3" fill="${c.accent}"/>
    ${text('MANAUS, BRASIL', 1008, 42, 11, { font: mono, color: c.muted })}
    ${text(config.name.toUpperCase(), 40, 119, 13, { font: mono, color: c.muted, spacing: 2 })}
    ${text(config.wordmark, 32, 243, 148, { font: bold, spacing: -7 })}
    <circle cx="527" cy="231" r="10" fill="${c.accent}"/>
    ${text(config.role, 40, 286, 23)}
    ${text(config.headline.join(' '), 40, 319, 18, { color: c.muted })}
    <path d="M622 107V91h16m506 0h16v16M622 312v16h16m506 0h16v-16" fill="none" stroke="${c.muted}" stroke-opacity=".7"/>
    <path d="M879 208h18m-9-9v18" stroke="${c.accent}" stroke-width="1.5"/>
    ${text('DA COMPLEXIDADE À CLAREZA.', 40, 392, 12, { font: mono, color: c.accent, spacing: 1 })}
    ${text('INTERFACES / SISTEMAS / PRODUTOS', 839, 392, 11, { font: mono, color: c.muted })}
  `, config.name);
  const base = await sharp(Buffer.from(backdrop)).png().toBuffer();
  const top = await sharp(Buffer.from(overlay)).png().toBuffer();
  const encoder = GIFEncoder();
  let palette;
  for (let i = 0; i < frames; i++) {
    const page = Math.floor(i * metadata.pages / frames);
    const { data, info } = await sharp(source, { page, pages: 1 })
      .resize(640, 314, { fit: 'fill' }).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
    const pixels = Buffer.alloc(info.width * info.height * 4);
    for (let pixel = 0; pixel < data.length; pixel++) {
      const light = data[pixel] / 255;
      pixels[pixel * 4] = 239;
      pixels[pixel * 4 + 1] = 244;
      pixels[pixel * 4 + 2] = 234;
      pixels[pixel * 4 + 3] = Math.round(Math.pow(light, 0.74) * 242);
    }
    const rgba = await sharp(base).composite([
      { input: pixels, raw: { width: info.width, height: info.height, channels: 4 }, left: 552, top: 54 },
      { input: top, left: 0, top: 0 },
    ]).ensureAlpha().raw().toBuffer();
    if (i === 0) {
      palette = quantize(rgba, 128);
      await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(path.join(assets, 'hero.png'));
    }
    encoder.writeFrame(applyPalette(rgba, palette), width, height, {
      ...(i === 0 ? { palette } : {}), delay, repeat: 0, dispose: 1,
    });
    if ((i + 1) % 16 === 0) console.log(`Banner: ${i + 1}/${frames} frames`);
  }
  encoder.finish();
  // Reotimiza regiões repetidas para manter a animação leve.
  await sharp(Buffer.from(encoder.bytes()), { animated: true })
    .gif({ effort: 7, dither: 0, reoptimise: true, interFrameMaxError: 0 })
    .toFile(path.join(assets, 'hero.gif'));
  const result = await sharp(path.join(assets, 'hero.gif')).metadata();
  const { size } = await stat(path.join(assets, 'hero.gif'));
  console.log(`GIF final: ${result.pages} frames, ${(size / 1024).toFixed(0)} KB`);
}

async function buildStack() {
  async function layout(columns, width, name) {
  const step = columns === 5 ? 236 : 290;
  const cardWidth = step - 20;
  const icons = await Promise.all(config.stack.map(async (item, index) => {
    const source = await readFile(path.join(cache, 'icons', `${item.slug}.svg`), 'utf8');
    const iconPath = source.match(/<path\s+d="([^"]+)"/)?.[1];
    if (!iconPath) throw new Error(`Ícone sem path: ${item.slug}`);
    const x = 20 + (index % columns) * step;
    const y = 16 + Math.floor(index / columns) * 64;
    return `<g transform="translate(${x} ${y})">
      <rect width="${cardWidth}" height="52" rx="8" fill="${c.surface}" stroke="${c.border}"/>
      <g transform="translate(16 12) scale(1.16)" fill="${index < 5 ? c.accent : c.muted}"><path d="${iconPath}"/></g>
      ${text(item.label, 60, 34, columns === 5 ? 19 : 24)}
    </g>`;
  }));
  await saveSVG(name, width, 20 + Math.ceil(config.stack.length / columns) * 64, icons.join(''), config.stack.map(item => item.label).join(', '));
  }
  await layout(5, 1200, 'stack');
  await layout(2, 600, 'stack-mobile');
}

async function buildMobileHero() {
  const input = await readFile(path.join(assets, 'hero.gif'));
  const { pages } = await sharp(input).metadata();
  const width = 600, height = 640;
  const base = await sharp(Buffer.from(svg(width, height,
    `<rect width="600" height="640" rx="16" fill="${c.background}"/>`, config.name))).png().toBuffer();
  const overlay = await sharp(Buffer.from(svg(width, height, `
    <rect x="1" y="1" width="598" height="638" rx="15" fill="none" stroke="${c.border}"/>
    <path d="M30 592h540" stroke="${c.border}"/>
    ${text('FEITO EM MANAUS, BRASIL.', 30, 620, 11, { font: mono, color: c.accent, spacing: 1 })}
  `, config.name))).png().toBuffer();
  const encoder = GIFEncoder();
  let palette;
  for (let page = 0; page < pages; page++) {
    const frame = await sharp(input, { page, pages: 1 }).png().toBuffer();
    const typography = await sharp(frame).extract({ left: 26, top: 20, width: 520, height: 315 }).png().toBuffer();
    const art = await sharp(frame).extract({ left: 600, top: 80, width: 578, height: 260 }).png().toBuffer();
    const rgba = await sharp(base).composite([
      { input: typography, left: 28, top: 20 },
      { input: art, left: 11, top: 326 },
      { input: overlay, left: 0, top: 0 },
    ]).ensureAlpha().raw().toBuffer();
    if (page === 0) {
      palette = quantize(rgba, 128);
      await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toFile(path.join(assets, 'hero-mobile.png'));
    }
    encoder.writeFrame(applyPalette(rgba, palette), width, height, {
      ...(page === 0 ? { palette } : {}), delay: config.animation.delay, repeat: 0, dispose: 1,
    });
  }
  encoder.finish();
  await sharp(Buffer.from(encoder.bytes()), { animated: true })
    .gif({ effort: 7, dither: 0, reoptimise: true, interFrameMaxError: 0 })
    .toFile(path.join(assets, 'hero-mobile.gif'));
}

async function buildProjects() {
  for (const [index, project] of config.projects.entries()) {
    await saveSVG(`project-${project.id}`, 580, 250, `
      <rect x="1" y="1" width="578" height="248" rx="12" fill="${c.surface}" stroke="${c.border}"/>
      <rect x="25" y="28" width="3" height="14" rx="1" fill="${c.accent}"/>
      ${text(project.category, 39, 40, 11, { font: mono, color: c.muted, spacing: 1 })}
      ${arrow(534, 27)}
      ${text(project.name, 25, 96, 37, { font: bold })}
      ${project.lines.map((line, row) => text(line, 25, 135 + row * 28, 23, { color: c.muted })).join('')}
      <path d="M25 187h530" stroke="${c.border}"/>
      ${text(project.stack, 25, 220, 15, { font: mono, color: c.accent })}
      ${text(`0${index + 1}`, 528, 220, 12, { font: mono, color: c.muted })}
    `, `${project.name}: ${project.lines.join(' ')} Stack: ${project.stack}`);
  }
}

async function buildContacts() {
  const widths = { portfolio: 196, linkedin: 174, email: 250 };
  for (const link of config.links) {
    const width = widths[link.id];
    const color = link.primary ? c.background : c.text;
    const icon = link.id === 'portfolio'
      ? '<rect x="18" y="14" width="20" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 20h20m-13 0v13" fill="none" stroke="currentColor" stroke-width="1.5"/>'
      : link.id === 'email'
        ? '<rect x="18" y="16" width="22" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m19 17 10 8 10-8" fill="none" stroke="currentColor" stroke-width="1.5"/>'
        : text('in', 19, 31, 22, { font: bold, color });
    await saveSVG(`link-${link.id}`, width, 48, `
      <rect x="1" y="1" width="${width - 2}" height="46" rx="8" fill="${link.primary ? c.accent : c.surface}" stroke="${link.primary ? c.accent : c.border}"/>
      <g color="${color}">${icon}</g>
      ${text(link.label, 51, 30, 17, { color })}
      ${arrow(width - 30, 17, color)}
    `, link.label);
  }
}

await buildHero();
await buildMobileHero();
await buildStack();
await buildProjects();
await buildContacts();

const contacts = config.links.map(link => `  <a href="${xml(link.href)}"><img src="./assets/link-${link.id}.svg" height="40" alt="${xml(link.label)}" /></a>`).join('\n');
const projects = config.projects.map(project => `  <a href="${xml(project.href)}"><img src="./assets/project-${project.id}.svg" width="410" alt="${xml(`${project.name} — ${project.lines.join(' ')} ${project.stack}`)}" /></a>`).join('\n');
const moreProjects = config.moreProjects.map(project => `<a href="${xml(project.href)}" title="${xml(project.detail)}">${xml(project.label)}</a>`).join(' &nbsp;·&nbsp; ');
const readme = `<p align="center">
  <picture>
    <source media="(max-width: 600px) and (prefers-reduced-motion: reduce)" srcset="./assets/hero-mobile.png" />
    <source media="(prefers-reduced-motion: reduce)" srcset="./assets/hero.png" />
    <source media="(max-width: 600px)" srcset="./assets/hero-mobile.gif" />
    <img src="./assets/hero.gif" width="1200" alt="${xml(`${config.name} · ${config.role} · ${config.location}. ${config.headline.join(' ')}`)}" />
  </picture>
</p>

<p align="center">
${contacts}
</p>

### Transformo regras complexas em produtos que funcionam.

${config.bio}

**Por onde passei** &nbsp; ${config.experience.join(' · ')}<br />
**Busco oportunidades** &nbsp; Frontend · Full Stack · Backend

### Stack principal

<picture>
  <source media="(max-width: 600px)" srcset="./assets/stack-mobile.svg" />
  <img src="./assets/stack.svg" width="1200" alt="${xml(config.stack.map(item => item.label).join(', '))}" />
</picture>

### Do produto ao código

<p>
${projects}
</p>

<p align="center">
  <sub>Explore também &nbsp; ${moreProjects}</sub>
</p>

<p align="center">
  <sub>Feito em Manaus. Pensado para ir além. &nbsp;↗&nbsp; <a href="${xml(config.links[0].href)}">Conheça meu trabalho</a></sub>
</p>
`;
await writeFile(path.join(root, 'README.md'), readme);

await mkdir(path.join(assets, 'licenses'), { recursive: true });
await Promise.all([
  copyFile(path.join(cache, 'fonts/space-grotesk-OFL.txt'), path.join(assets, 'licenses/Space-Grotesk-OFL.txt')),
  copyFile(path.join(cache, 'fonts/plex-mono-OFL.txt'), path.join(assets, 'licenses/IBM-Plex-Mono-OFL.txt')),
  copyFile(path.join(cache, 'simple-icons-LICENSE.md'), path.join(assets, 'licenses/Simple-Icons-CC0.txt')),
  copyFile(path.join(cache, 'sources.json'), path.join(assets, 'sources.json')),
]);
console.log('README, banner, stack, cards e contatos gerados.');
