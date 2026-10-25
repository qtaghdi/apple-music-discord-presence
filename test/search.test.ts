import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const file = (path: string) => readFile(fileURLToPath(new URL(`../../site/${path}`, import.meta.url)), 'utf8');
const base = 'https://qtaghdi.github.io/apple-music-discord-presence/';

test('language pages expose distinct canonicals and crawlable content without JavaScript', async () => {
  for (const [path, lang, canonical] of [['index.html', 'en', base], ['ko/index.html', 'ko', base + 'ko/']]) {
    const html = await file(path!);
    assert.ok(html.includes(`<html lang="${lang}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
    assert.ok(html.includes(`hreflang="en" href="${base}"`));
    assert.ok(html.includes(`hreflang="ko" href="${base}ko/"`));
    assert.match(html, /name="robots" content="index, follow/);
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!);
    assert.equal(data['@type'], 'SoftwareApplication');
    assert.equal(data.url, canonical);
    assert.equal(data.inLanguage, lang);
    assert.equal(data.offers.price, '0');
    assert.equal(data.aggregateRating, undefined);
    if (lang === 'ko') {
      assert.match(html, /지금 듣는 음악,/);
      assert.match(html, /src="\.\.\/i18n\.js/);
      assert.match(html, /data-i18n-source="Download"/);
    }
  }
});

test('sitemap lists only real canonical language URLs', async () => {
  const sitemap = await file('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls, [base, base + 'ko/']);
});
