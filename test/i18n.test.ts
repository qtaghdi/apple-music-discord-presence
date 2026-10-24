import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";

interface LanguageApi {
  chooseLanguage(query: string | null, saved: string | null, languages: string[]): string;
  setLanguage(value: string): void;
  t(message: string, values?: Record<string, string>): string;
  language: string;
}
const source = () => readFile(fileURLToPath(new URL('../../site/i18n.js', import.meta.url)), 'utf8');

test('language priority respects links, preferences, and browser locales', async () => {
  const window: { AMDPI18n?: LanguageApi } = {};
  runInNewContext(await source(), { window });
  const api = window.AMDPI18n!;
  assert.equal(api.chooseLanguage('en', 'ko', ['ko-KR']), 'en');
  assert.equal(api.chooseLanguage(null, 'en', ['ko-KR']), 'en');
  assert.equal(api.chooseLanguage('unknown', null, ['fr-FR', 'ko-KR', 'en-US']), 'ko');
  assert.equal(api.chooseLanguage(null, null, ['en-US', 'ko-KR']), 'en');
  assert.equal(api.chooseLanguage(null, null, ['fr-FR']), 'en');
});

test('language changes work without storage and safely format release labels', async () => {
  const window: { AMDPI18n?: LanguageApi } = {};
  runInNewContext(await source(), { window });
  const api = window.AMDPI18n!;
  api.setLanguage('ko');
  assert.equal(api.t('Save changes'), '변경 사항 저장');
  assert.equal(api.t('{version} available', {version:'v0.7.0'}), 'v0.7.0 다운로드 가능');
  assert.equal(api.t('Artist - Original Title'), 'Artist - Original Title');
  api.setLanguage('invalid');
  assert.equal(api.language, 'ko');
  api.setLanguage('en');
  assert.equal(api.t('Save changes'), 'Save changes');
});

test('both packaged surfaces share the same localization behavior', async () => {
  const settings = await readFile(fileURLToPath(new URL('../../settings/i18n.js', import.meta.url)), 'utf8');
  assert.equal(settings, await source());
});
