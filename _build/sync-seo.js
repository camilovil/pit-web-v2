// _build/sync-seo.js — canonicals, Open Graph URL, sitemap and robots.
//
// Vercel serves this project with cleanUrls, so every public URL is written
// without the .html suffix. Keeping this in one build step prevents new forum
// posts or pages from shipping without a canonical or falling out of sitemap.
const fs = require('fs');
const path = require('path');
const { STAGING } = require('./site');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://drricardofrusso.com';
const SKIP = new Set(['certificado.html']);

function pages() {
  const rootPages = fs.readdirSync(ROOT)
    .filter(file => file.endsWith('.html') && !SKIP.has(file));
  const forumDir = path.join(ROOT, 'foro');
  const forumPages = fs.existsSync(forumDir)
    ? fs.readdirSync(forumDir).filter(file => file.endsWith('.html')).map(file => path.join('foro', file))
    : [];
  return [...rootPages, ...forumPages].sort();
}

function publicPath(rel) {
  const normalized = rel.replace(/\\/g, '/');
  if (normalized === 'index.html') return '/';
  return '/' + normalized.replace(/\.html$/, '');
}

function upsert(html, pattern, markup, anchor) {
  if (pattern.test(html)) return html.replace(pattern, markup);
  if (!anchor.test(html)) throw new Error(`no se encontró el ancla SEO ${anchor}`);
  return html.replace(anchor, match => `${match}\n  ${markup}`);
}

const urls = [];
for (const rel of pages()) {
  const file = path.join(ROOT, rel);
  const url = ORIGIN + publicPath(rel);
  let html = fs.readFileSync(file, 'utf8');
  html = upsert(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${url}">`,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i
  );
  html = upsert(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${url}">`,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i
  );
  fs.writeFileSync(file, html);
  urls.push(url);
  console.log(`SEO  ${rel}  → ${url}`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

const robots = STAGING
  ? `User-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);

console.log(`OK   sitemap.xml (${urls.length} URLs) y robots.txt (${STAGING ? 'staging' : 'producción'})`);
