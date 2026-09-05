// Genere dist/tokens.css a partir des memes objets TS que consomme React Native,
// afin que Web et Mobile ne divergent jamais sur les valeurs de couleur/espacement.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const distDir = path.dirname(fileURLToPath(import.meta.url)).replace(/scripts$/, 'dist');
const { lightPalette, darkPalette, spacing, radius } = await import(
  pathToFileURL(path.join(distDir, 'index.js')).href
);

function paletteVars(palette) {
  return Object.entries(palette)
    .map(([key, value]) => `  --color-${toKebab(key)}: ${value};`)
    .join('\n');
}

function spacingVars(scale, prefix) {
  return Object.entries(scale)
    .map(([key, value]) => `  --${prefix}-${toKebab(key)}: ${typeof value === 'number' ? `${value}px` : value};`)
    .join('\n');
}

function toKebab(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const css = `/* Genere automatiquement par packages/design-tokens/scripts/generate-css.mjs — ne pas editer a la main. */
:root{
${paletteVars(lightPalette)}
${spacingVars(spacing, 'space')}
${spacingVars(radius, 'radius')}
  color-scheme: light;
}

@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
${paletteVars(darkPalette)}
    color-scheme: dark;
  }
}

:root[data-theme="dark"]{
${paletteVars(darkPalette)}
  color-scheme: dark;
}
`;

await writeFile(path.join(distDir, 'tokens.css'), css, 'utf8');
console.log('tokens.css genere dans', path.join(distDir, 'tokens.css'));
