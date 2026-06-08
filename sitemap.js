// sitemap.js — بيولد sitemap.xml لجوجل
const fs   = require('fs');
const path = require('path');

const DIST     = path.join(__dirname, 'dist');
// ⚠️ التعديل هنا: تم تحديث الدومين وإضافة مسار المجلد الفرعي الفعلي للمشروع
const BASE_URL = 'https://infopharmsoft-dotcom.github.io/infopharm';

const drugsDir = path.join(DIST, 'drug');
const slugs    = fs.readdirSync(drugsDir).filter(f =>
  fs.statSync(path.join(drugsDir, f)).isDirectory()
);

console.log(`📝 بيكتب sitemap لـ ${slugs.length} صفحة...`);

// جوجل بيقبل max 50,000 URL في sitemap واحد
const CHUNK = 40000;
const chunks = [];
for (let i = 0; i < slugs.length; i += CHUNK) {
  chunks.push(slugs.slice(i, i + CHUNK));
}

const today = new Date().toISOString().split('T')[0];

if (chunks.length === 1) {
  // sitemap واحد
  const urls = slugs.map(slug =>
    `  <url>
    <loc>${BASE_URL}/drug/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log('✅ sitemap.xml تم إنشاؤه بنجاح بالدومين الجديد');

} else {
  // sitemap index لو أكتر من 40k صفحة
  chunks.forEach((chunk, idx) => {
    const urls = chunk.map(slug =>
      `  <url>
    <loc>${BASE_URL}/drug/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    fs.writeFileSync(path.join(DIST, `sitemap-${idx + 1}.xml`), xml, 'utf8');
  });

  // sitemap index
  const sitemapIndex = chunks.map((_, idx) =>
    `  <sitemap>
    <loc>${BASE_URL}/sitemap-${idx + 1}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
  ).join('\n');

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapIndex}
</sitemapindex>`;

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), indexXml, 'utf8');
  console.log(`✅ sitemap index + ${chunks.length} sitemaps تم إنشاؤهم بالدومين الجديد`);
}

// robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;

fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');
console.log('✅ robots.txt تم إنشاؤه بالدومين الجديد');
