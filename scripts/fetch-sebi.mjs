// Refreshes data/sebi.json with SEBI items about investment advisers. Runs daily in GitHub Actions.
// Node 18+, no dependencies. If SEBI is unreachable, the previous file is kept and the run still succeeds.
import { readFile, writeFile } from 'node:fs/promises';
import { parseSebiRss, parseSebiListing } from './lib.mjs';

const ROOT = new URL('..', import.meta.url);
const RSS = 'https://www.sebi.gov.in/sebirss.xml';
const LISTING = 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0';
const UA = 'Mozilla/5.0 (compatible; ria-site-refresh/1.0)';

async function get(url) {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.text();
    } catch (e) { console.warn(url, 'attempt', i, e.message); await new Promise((r) => setTimeout(r, 3000 * i)); }
  }
  return null;
}
const fresh = [];
const rss = await get(RSS); if (rss) fresh.push(...parseSebiRss(rss));
const html = await get(LISTING); if (html) fresh.push(...parseSebiListing(html, 'Circular'));
const file = new URL('data/sebi.json', ROOT);
const prev = JSON.parse(await readFile(file, 'utf8').catch(() => '{"items":[]}'));
if (!fresh.length) { console.warn('SEBI unreachable; kept previous data'); process.exit(0); }
const seen = new Set();
const items = [...fresh.filter((i) => i.ia), ...(prev.items || [])]
  .filter((i) => { const k = i.link + '|' + i.title; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 40);
await writeFile(file, JSON.stringify({ updatedAt: new Date().toISOString(), sources: [RSS, LISTING], items }) + '\n');
console.log(`SEBI: ${fresh.length} fetched, ${items.length} kept`);
