import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const english = await readFile(join(site, 'index.html'), 'utf8');
const window = {};
runInNewContext(await readFile(join(site, 'i18n.js'), 'utf8'), { window });
const messages = window.AMDPI18n.messages;
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
// This controlled template copies script and style bodies verbatim.
let inScript = false;
let korean = english.replace(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g, (token) => {
  if (token.startsWith('<')) {
    if (/^<(?:script|style)\b/i.test(token)) inScript = true;
    if (/^<\/(?:script|style)/i.test(token)) inScript = false;
    if (token.startsWith('<!--')) return token;
    return token.replace(/\b(aria-label|alt|content)="([^"]*)"/g, (match, attr, raw) => {
      const source = decode(raw);
      return messages[source] ? `${attr}="${escape(messages[source])}" data-i18n-original-${attr}="${escape(source)}"` : match;
    });
  }
  if (inScript) return token;
  const key = decode(token.trim());
  return messages[key] ? token.replace(token.trim(), `<span data-i18n-source="${escape(key)}">${escape(messages[key])}</span>`) : token;
});
korean = korean
  .replace('<html lang="en"', '<html lang="ko"')
  .replace('data-site-root="./"', 'data-site-root="../"')
  .replace('<title>Apple Music Discord Presence for macOS &amp; Windows | AM Presence</title>', '<title>애플뮤직 디스코드 연동 · 앨범 커버와 재생바 | AM Presence</title>')
  .replace(/(<link rel="canonical" href=")[^"]+/, '$1https://qtaghdi.github.io/apple-music-discord-presence/ko/')
  .replace(/(<meta property="og:url" content=")[^"]+/, '$1https://qtaghdi.github.io/apple-music-discord-presence/ko/')
  .replace('property="og:locale" content="en_US"', 'property="og:locale" content="ko_KR"')
  .replace(/"inLanguage": "en"/, '"inLanguage": "ko"')
  .replace(/"url": "https:\/\/qtaghdi.github.io\/apple-music-discord-presence\/"/, '"url": "https://qtaghdi.github.io/apple-music-discord-presence/ko/"')
  .replace(/\b(src|href)="((?:icons\/|assets\/|styles\.css|app\.js|i18n\.js|favicon\.svg)[^"]*)"/g, '$1="../$2"');
await mkdir(join(site, 'ko'), { recursive: true });
await writeFile(join(site, 'ko', 'index.html'), korean);
console.log('Generated crawlable Korean landing page.');
