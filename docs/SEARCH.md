# Search discovery

Canonical public pages:

- English: https://qtaghdi.github.io/apple-music-discord-presence/
- Korean: https://qtaghdi.github.io/apple-music-discord-presence/ko/
- Sitemap: https://qtaghdi.github.io/apple-music-discord-presence/sitemap.xml

`npm run build:site` generates the Korean HTML from the English template and shared translation dictionary. Commit the generated page; CI checks that it is current. Pages also regenerates it before publishing. Both pages contain real translated text without needing JavaScript, reciprocal hreflang links, self-canonical URLs, and SoftwareApplication JSON-LD. Do not add fabricated ratings or star counts.

The Google site-verification meta tag was issued for the project owner's Search Console URL-prefix property. Keep it in the source to retain verification. Search Console sitemap submission and URL inspection are managed through that account.

After deploying changed pages, run `node scripts/submit-indexnow.mjs` to notify participating engines. Its key is intentionally public and published at the supplied keyLocation. An accepted submission is not a guarantee of indexing or ranking. The sitemap remains the long-term discovery source.

This is a GitHub Pages **project** site. A file inside `/apple-music-discord-presence/robots.txt` would not control the host: crawlers consult `https://qtaghdi.github.io/robots.txt` instead. Use the indexable meta tags, sitemap and verified webmaster property here; changing host-level robots rules would require control of the separate root website.

## Windows icon verification

After `scripts/package-windows.ps1`, run `scripts/verify-windows-package.ps1 -Archive release/apple-music-discord-presence-windows-x64.zip` on Windows. It extracts the actual ZIP into a temporary path with spaces, verifies required files, decodes the ICO at 16/32/48 pixels, and saves/reloads a COM shortcut with that icon. This is not a visual Explorer/tray end-to-end test. Existing users should fully extract the new ZIP, quit the old client, and rerun Install.cmd to update the shortcut. Keep the extracted application folder in place.
