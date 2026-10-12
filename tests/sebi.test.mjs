import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSebiListing, parseSebiRss, isIA, isoDate } from '../scripts/lib.mjs';

test('keeps adviser items, drops others', () => {
  assert.ok(isIA('Most Important Terms and Conditions (MITC) for Investment Advisers'));
  assert.ok(isIA('Centralised Fee Collection Mechanism (CeFCoM) for IAs and RAs'));
  assert.ok(!isIA('Revision of Application Form for Mutual Fund Registration'));
});
test('parses SEBI listing rows and RSS items', () => {
  const html = '<table><tr><td>Feb 17, 2025<td><a href="/legal/circulars/feb-2025/mitc_91963.html" title="Most Important Terms and Conditions (MITC) for Investment Advisers">MITC</a></table>';
  const [r] = parseSebiListing(html);
  assert.equal(r.date, '2025-02-17'); assert.ok(r.link.startsWith('https://www.sebi.gov.in/')); assert.equal(r.ia, true);
  const xml = '<rss><item><title><![CDATA[Guidelines for Investment Advisers]]></title><link>https://www.sebi.gov.in/legal/circulars/jan-2025/x.html</link><pubDate>08 Jan, 2025 +0530</pubDate></item></rss>';
  const [i] = parseSebiRss(xml);
  assert.equal(i.type, 'Circular'); assert.equal(i.date, '2025-01-08'); assert.equal(i.ia, true);
  assert.equal(isoDate('nonsense'), '');
});
