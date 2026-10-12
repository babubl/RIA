// Parsers for SEBI's RSS feed and circulars listing (adapted from the FundFit data refresh).
// Only items about investment advisers (and closely related rules) are kept.
const IA_RE = /investment advis|\bR?IAs?\b|\bIAASB\b|\bBASL\b|CeFCoM|fee collection|research analysts?|finfluencer|unregistered|investor charter/i;
export const isIA = (text) => IA_RE.test(text || '');

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
// "Sep 09, 2026", "24 Sep, 2026 +0530", "Thu, 26 Feb 2026 18:00:00 +0530" -> "2026-09-09"
export function isoDate(str) {
  const s = String(str || '');
  let m = s.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/) ; // Sep 09, 2026
  let d, mo, y;
  if (m && MONTHS[m[1].toLowerCase()] !== undefined) { mo = MONTHS[m[1].toLowerCase()]; d = +m[2]; y = +m[3]; }
  else if ((m = s.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})/)) && MONTHS[m[2].toLowerCase()] !== undefined) { d = +m[1]; mo = MONTHS[m[2].toLowerCase()]; y = +m[3]; }
  else return '';
  return `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const decode = (x) => x.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

// SEBI RSS: latest ~30 items of every kind (orders, press releases, circulars).
export function parseSebiRss(xml) {
  const items = [];
  const get = (block, tag) => {
    const m = block.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
    return m ? decode(m[1]) : '';
  };
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const b = m[0];
    const title = get(b, 'title');
    if (!title) continue;
    const link = get(b, 'link');
    items.push({ title, link, date: isoDate(get(b, 'pubDate')), type: typeFromLink(link), ia: isIA(title + ' ' + get(b, 'description')) });
  }
  return items;
}

// SEBI circulars listing page: <tr><td>Sep 09, 2026</td><td><a href="...">Title</a></td></tr>
export function parseSebiListing(html, type = 'Circular') {
  const items = [];
  // Split on row openings: SEBI's markup doesn't reliably close <tr> or <td>.
  for (const row of html.split(/<tr[\s>]/i).slice(1)) {
    const cells = row.split(/<td[^>]*>/i).slice(1).map((c) => c.replace(/<\/td>[\s\S]*$/i, ''));
    if (cells.length < 2) continue;
    const date = isoDate(decode(cells[0]));
    const a = row.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([^<]*)/i); // no </a> needed
    if (!date || !a) continue;
    const titleAttr = a[0].match(/title=["']([^"']+)["']/i);
    const title = decode(titleAttr ? titleAttr[1] : a[2]);
    let link = a[1];
    if (link.startsWith('/')) link = 'https://www.sebi.gov.in' + link;
    items.push({ title, link, date, type, ia: isIA(title) });
  }
  return items;
}

function typeFromLink(link) {
  if (/\/circulars\//.test(link)) return 'Circular';
  if (/\/master-circulars\//.test(link)) return 'Master circular';
  if (/\/regulations\//.test(link)) return 'Regulation';
  if (/press-releases/.test(link)) return 'Press release';
  if (/consultation|reports-and-statistics\/reports/.test(link)) return 'Consultation';
  if (/enforcement|orders/.test(link)) return 'Order';
  return 'Update';
}
