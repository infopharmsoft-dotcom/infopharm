// generate.js — بيولد صفحة HTML لكل دواء
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── تحميل وفك ضغط الداتا ──
const compressed = fs.readFileSync('drugs.json.gz');
const drugs      = JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));

console.log(`✅ تم تحميل ${drugs.length} صنف`);

// ── إنشاء مجلد الـ output ──
const DIST = path.join(__dirname, 'dist');
const DRUGS_DIR = path.join(DIST, 'drug');
fs.mkdirSync(DRUGS_DIR, { recursive: true });

// ── دوال مساعدة ──
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toString();
  if (d.length === 8) return `${d.slice(6)}/${d.slice(4,6)}/${d.slice(0,4)}`;
  const dt = new Date(Number(ts));
  if (isNaN(dt)) return '';
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function priceChange(oldp, newp) {
  const o = parseFloat(oldp), n = parseFloat(newp);
  if (!isNaN(o) && !isNaN(n) && n > o) {
    const pct = Math.round(((n - o) / o) * 100);
    return `<span class="badge-up">🔺 زيادة ${pct}%</span>
            <span class="old-price">${o.toFixed(2)} ج.م</span>`;
  }
  return '';
}

// iHerb Affiliate — كود الـ affiliate بتاعك (غيّر YOURCODE)
const IHERB_CODE = 'YOURCODE';
function iherbLink(drug) {
  // بنبحث بالمادة الفعالة لأنها أكثر دقة
  const query = encodeURIComponent(drug.active || drug.name);
  return `https://www.iherb.com/search?kw=${query}&rcode=${IHERB_CODE}`;
}

// ── Template HTML ──
function buildPage(drug, slug) {
  const price    = parseFloat(drug.price) || 0;
  const unitP    = drug.units > 1 ? (price / drug.units).toFixed(2) : null;
  const dateStr  = formatDate(drug.Date_updated);
  const appUrl   = `https://infopharmprice.blogspot.com/?drug=${encodeURIComponent(drug.name)}`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escHtml(drug.name)} | سعر الدواء في مصر - Infopharm</title>
<meta name="description" content="سعر ${escHtml(drug.name)} في مصر ${price} جنيه. المادة الفعالة: ${escHtml(drug.active)}. شركة: ${escHtml(drug.company)}. آخر تحديث: ${dateStr}"/>
<meta name="keywords" content="${escHtml(drug.name)}, ${escHtml(drug.active)}, سعر دواء, أدوية مصر"/>
<link rel="canonical" href="https://infopharmsoft-dotcom.github.io/infopharm/drug/${slug}/"/>
<meta property="og:title" content="${escHtml(drug.name)} | Infopharm"/>
<meta property="og:description" content="سعر ${escHtml(drug.name)}: ${price} ج.م | ${escHtml(drug.active)}"/>
<meta property="og:url" content="https://infopharmsoft-dotcom.github.io/infopharm/drug/${slug}/"/>
<meta property="og:type" content="product"/>
<meta name="google-site-verification" content="8VaHhORs2kWN8gHYegdOOGHKn8ZypKAwJ8_i924trV8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"/>
<style>
:root{--blue:#1976D2;--blue-l:#E3F2FD;--red:#F44336;--green:#4CAF50;--bg:#F5F7FA;--card:#fff;--txt:#212121;--txt2:#616161;--border:#E0E0E0;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Cairo',sans-serif;background:var(--bg);color:var(--txt);direction:rtl;min-height:100vh;}
header{background:var(--blue);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,.2);}
header a{color:#fff;text-decoration:none;font-weight:700;font-size:17px;}
header span{font-size:12px;opacity:.75;display:block;}
.wrap{max-width:680px;margin:0 auto;padding:16px 12px 60px;}
.card{background:var(--card);border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,.1);border:1px solid var(--border);margin-bottom:14px;overflow:hidden;}
.price-hero{background:linear-gradient(135deg,#1976D2,#0D47A1);color:#fff;padding:24px 20px;text-align:center;}
.price-hero .drug-name{font-size:20px;font-weight:900;margin-bottom:4px;line-height:1.3;}
.price-hero .drug-arabic{font-size:14px;opacity:.85;margin-bottom:16px;}
.price-hero .price-val{font-size:48px;font-weight:900;line-height:1;}
.price-hero .price-sub{font-size:13px;opacity:.8;margin-top:4px;}
.badge-up{background:#FF5252;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;display:inline-block;margin-left:6px;}
.old-price{font-size:14px;text-decoration:line-through;opacity:.65;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);}
.info-cell{background:var(--card);padding:14px 16px;}
.info-cell .lbl{font-size:11px;color:var(--txt2);font-weight:600;margin-bottom:3px;}
.info-cell .val{font-size:14px;font-weight:700;color:var(--txt);}
.section{padding:16px;}
.section h2{font-size:15px;font-weight:700;color:var(--blue);margin-bottom:10px;padding-bottom:8px;border-bottom:2px solid var(--blue-l);}
.section p{font-size:14px;color:var(--txt2);line-height:1.7;}
/* CTA Buttons */
.cta-wrap{display:flex;flex-direction:column;gap:10px;padding:0 12px 16px;}
.btn-app{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--blue);color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:700;box-shadow:0 3px 8px rgba(25,118,210,.35);}
.btn-iherb{display:flex;align-items:center;justify-content:center;gap:8px;background:#6CC04A;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:700;}
.btn-iherb small{font-size:11px;opacity:.9;font-weight:400;}
.date-badge{text-align:center;font-size:11px;color:var(--txt2);padding:8px;background:var(--bg);}
/* Breadcrumb */
.breadcrumb{font-size:12px;color:var(--txt2);margin-bottom:12px;}
.breadcrumb a{color:var(--blue);text-decoration:none;}
</style>
</head>
<body>

<header>
  <a href="https://infopharmprice.blogspot.com">
    💊 Infopharm Pro
    <span>مؤشر أسعار الأدوية في مصر</span>
  </a>
</header>

<div class="wrap">

  <div class="breadcrumb">
    <a href="https://infopharmprice.github.io">الرئيسية</a> ← ${escHtml(drug.dosage_form || 'دواء')} ← ${escHtml(drug.name)}
  </div>

  <!-- بطاقة السعر الرئيسية -->
  <div class="card">
    <div class="price-hero">
      <div class="drug-name">${escHtml(drug.name)}</div>
      ${drug.arabic ? `<div class="drug-arabic">${escHtml(drug.arabic)}</div>` : ''}
      <div class="price-val">${price.toFixed(2)}</div>
      <div class="price-sub">جنيه مصري ${priceChange(drug.oldprice, drug.price)}</div>
      ${unitP ? `<div class="price-sub" style="margin-top:8px;font-size:12px;">سعر الوحدة: ${unitP} ج.م</div>` : ''}
    </div>

    <!-- بيانات الدواء -->
    <div class="info-grid">
      ${drug.active ? `<div class="info-cell"><div class="lbl">المادة الفعالة</div><div class="val" style="font-size:12px;">${escHtml(drug.active)}</div></div>` : ''}
      ${drug.company ? `<div class="info-cell"><div class="lbl">الشركة المنتجة</div><div class="val" style="font-size:12px;">${escHtml(drug.company)}</div></div>` : ''}
      ${drug.dosage_form ? `<div class="info-cell"><div class="lbl">الشكل الدوائي</div><div class="val">${escHtml(drug.dosage_form)}</div></div>` : ''}
      ${drug.units ? `<div class="info-cell"><div class="lbl">عدد الوحدات</div><div class="val">${escHtml(drug.units)}</div></div>` : ''}
    </div>

    ${drug.details ? `
    <div class="section">
      <h2>📋 تفاصيل الدواء</h2>
      <p>${escHtml(drug.details)}</p>
    </div>` : ''}

    ${drug.description ? `
    <div class="section">
      <h2>📂 التصنيف</h2>
      <p>${escHtml(drug.description)}</p>
    </div>` : ''}

    <div class="date-badge">📅 آخر تحديث للسعر: ${dateStr}</div>
  </div>

  <!-- CTA Buttons -->
  <div class="cta-wrap">
    <a href="${appUrl}" class="btn-app">
      🔍 ابحث عن البدائل والمثيلات في التطبيق
    </a>
    <a href="${iherbLink(drug)}" class="btn-iherb" target="_blank" rel="noopener">
      🛒 اشتري المكملات والفيتامينات من iHerb
      <small>(شحن لمصر)</small>
    </a>
  </div>

</div>

<!-- Structured Data for Google -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Drug",
  "name": "${escHtml(drug.name)}",
  "alternateName": "${escHtml(drug.arabic || '')}",
  "activeIngredient": "${escHtml(drug.active || '')}",
  "manufacturer": {
    "@type": "Organization",
    "name": "${escHtml(drug.company || '')}"
  },
  "offers": {
    "@type": "Offer",
    "price": "${price}",
    "priceCurrency": "EGP",
    "availability": "https://schema.org/InStock"
  }
}
</script>

</body>
</html>`;
}

// ── توليد الصفحات ──
let count = 0;
const slugMap = {}; // لمنع تكرار الـ slugs

for (const drug of drugs) {
  if (!drug.name) continue;

  let slug = slugify(drug.name);

  // لو الـ slug متكرر، ضيف رقم
  if (slugMap[slug]) {
    slugMap[slug]++;
    slug = `${slug}-${slugMap[slug]}`;
  } else {
    slugMap[slug] = 1;
  }

  const dir  = path.join(DRUGS_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(drug, slug), 'utf8');

  count++;
  if (count % 1000 === 0) console.log(`⏳ ${count} / ${drugs.length}`);
}

// ── صفحة الـ index الرئيسية ──
const indexHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Infopharm Pro | دليل أسعار الأدوية في مصر</title>
<meta name="description" content="دليل شامل لأسعار ${drugs.length.toLocaleString()} دواء في مصر. ابحث عن سعر أي دواء، المادة الفعالة، والبدائل."/>
<link rel="canonical" href="https://infopharmprice.github.io/"/>
<meta http-equiv="refresh" content="0;url=https://infopharmprice.blogspot.com"/>
</head>
<body>
<p>جاري التحويل للتطبيق...</p>
</body>
</html>`;

fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml, 'utf8');

console.log(`\n🎉 تم توليد ${count} صفحة بنجاح!`);
