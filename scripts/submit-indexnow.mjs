// The published IndexNow key is an ownership proof, not a secret credential.
const host = 'qtaghdi.github.io';
const base = 'https://qtaghdi.github.io/apple-music-discord-presence/';
const key = '4bd6b116fb1017541875b53461b7ad2d';
const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ host, key, keyLocation: `${base}${key}.txt`, urlList: [base, `${base}ko/`] }),
});
console.log(`IndexNow submission: HTTP ${response.status}`);
if (![200, 202].includes(response.status)) throw new Error(await response.text());
