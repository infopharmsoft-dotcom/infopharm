// generate.js — بيولد صفحة HTML لكل دواء
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── تحميل drugs.json.gz ──
const compressed = fs.readFileSync('drugs.json.gz');
const drugs      = JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
console.log(`✅ تم تحميل ${drugs.length} صنف`);

// ── تحميل indications.json ──
let indications = {};
try {
  indications = JSON.parse(fs.readFileSync('indications.json', 'utf8'));
  console.log(`✅ تم تحميل indications.json`);
} catch(e) {
  console.log(`⚠️ indications.json مش موجود`);
}

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

// السماح بـ HTML محدود من indications
function safeHtml(str) {
  return String(str || '')
    .replace(/&(?!amp;|lt;|gt;|quot;)/g,'&amp;')
    .replace(/<(?!\/?b>)/g,'&lt;');
}

function priceChange(oldp, newp) {
  const o = parseFloat(oldp), n = parseFloat(newp);
  if (!isNaN(o) && !isNaN(n) && o > 0 && n > o) {
    const pct = Math.round(((n - o) / o) * 100);
    return `<span class="badge-up">🔺 زيادة ${pct}%</span>
            <span class="old-price">${o.toFixed(2)} ج.م</span>`;
  }
  return '';
}

// iHerb Affiliate
const IHERB_CODE = 'YOURCODE';
function iherbLink(drug) {
  const query = encodeURIComponent(drug.active || drug.name);
  return `https://www.iherb.com/search?kw=${query}&rcode=${IHERB_CODE}`;
}

// ── Category Mapping ──
const CATEGORY_MAP = {
  "anti-cough":           { name: "أدوية الكحة",           icon: "🍃" },
  "cold drug":            { name: "أدوية البرد",            icon: "🤧" },
  "tonic for men":        { name: "منشطات الرجال",          icon: "❤️" },
  "colon":                { name: "القولون",                icon: "🫀" },
  "anti-diabetic":        { name: "أدوية السكر",            icon: "🩸" },
  "delay action":         { name: "للتأخير عند الرجال",     icon: "⏱️" },
  "prostate":             { name: "البروستاتا",             icon: "🫁" },
  "antihistamine":        { name: "مضادات حساسية",          icon: "🌿" },
  "infertility":          { name: "زيادة الخصوبة",          icon: "🤰" },
  "antidepressants":      { name: "مضادات الاكتئاب",        icon: "🧠" },
  "antihyperlipidemic":   { name: "الكوليسترول",            icon: "🩺" },
  "contraceptive":        { name: "موانع الحمل",            icon: "🚫" },
  "anticoagulant":        { name: "مضادات التجلط",          icon: "🩸" },
  "antiviral":            { name: "مضادات فيروسات",         icon: "🦠" },
  "anti-acne":            { name: "حب الشباب",              icon: "🧴" },
  "antibiotic":           { name: "مضاد حيوي",              icon: "💊" },
  "multivitamins":        { name: "فيتامينات",              icon: "🍊" },
  "multivitamin":         { name: "فيتامينات",              icon: "🍊" },
  "cerebral":             { name: "أدوية المخ",             icon: "🧠" },
  "antioxidant":          { name: "مضادات أكسدة",           icon: "🍎" },
  "orthostatic":          { name: "ضغط الدم المنخفض",       icon: "📉" },
  "antihypertensive":     { name: "ضغط الدم المرتفع",       icon: "📈" },
  "mucolytic":            { name: "مذيبات البلغم",          icon: "🫁" },
  "antigout":             { name: "النقرس",                 icon: "🦶" },
  "diuretic":             { name: "مدرات البول",            icon: "💧" },
  "vaccine":              { name: "أمصال وتطعيمات",         icon: "💉" },
  "antidiarrheal":        { name: "الإسهال",                icon: "🚽" },
  "peptic ulcer":         { name: "قرحة المعدة",            icon: "🫀" },
  "peptic ulcer.proton pump inhibitor": { name: "قرحة المعدة", icon: "🫀" },
  "antacid":              { name: "الحموضة",                icon: "🔥" },
  "nausea":               { name: "أدوية الغثيان",          icon: "🤢" },
  "analgesic":            { name: "المسكنات",               icon: "💊" },
  "appetizer":            { name: "فاتح الشهية",            icon: "🍽️" },
  "iron":                 { name: "أدوية الحديد والأنيميا", icon: "🩸" },
  "anthelmintic":         { name: "الديدان",                icon: "🐛" },
  "antifungal":           { name: "مضاد فطريات",            icon: "🍄" },
  "whitening":            { name: "تفتيح البشرة",           icon: "✨" },
  "asthma":               { name: "أدوية الأزمة",           icon: "🫁" },
  "scar therapy":         { name: "إخفاء الندبات",          icon: "🌟" },
  "vitamin d":            { name: "فيتامين د",              icon: "☀️" },
  "massage":              { name: "مساج للعضلات",           icon: "💆" },
  "psoriasis":            { name: "أدوية الصدفية",          icon: "🧴" },
  "moisturizing":         { name: "مرطبات الجلد",           icon: "💧" },
  "laxative":             { name: "الملينات",               icon: "🚽" },
  "antiflatulent":        { name: "الانتفاخ والغازات",      icon: "💨" },
  "antimigraine":         { name: "الصداع النصفي",          icon: "🤕" },
  "anti-epileptic":       { name: "مهدئات",                 icon: "😴" },
  "digestive":            { name: "عسر الهضم",              icon: "🍽️" },
  "calcium supplement":   { name: "كالسيوم للعظام",         icon: "🦴" },
  "antispasmodic":        { name: "المغص والتقلصات",        icon: "🤰" },
  "osteoarthritis":       { name: "الروماتزم والخشونة",     icon: "🦴" },
  "antidandruff":         { name: "مضاد للقشرة",            icon: "🧴" },
  "cerebral circulatory": { name: "زيادة التركيز",          icon: "🎯" },
  "zinc supplement":      { name: "الزينك",                 icon: "🔋" },
  "anesthetic":           { name: "مخدر موضعي",             icon: "💉" },
  "vitamin b":            { name: "فيتامين بي",             icon: "🍞" },
  "immunity":             { name: "مقويات المناعة",         icon: "🛡️" },
  "bronchodilator":       { name: "موسع الشعب",             icon: "🫁" },
  "edematous":            { name: "مضادات التورم",          icon: "💧" },
  "vitamin c":            { name: "فيتامين سي",             icon: "🍊" },
  "muscle":               { name: "أدوية العضلات",          icon: "💪" },
  "hair care":            { name: "العناية بالشعر",         icon: "💇" },
  "glaucoma":             { name: "الجلكوما",               icon: "👁️" },
  "wax remover":          { name: "مزيل شمع الأذن",         icon: "👂" },
  "antiprotozoal":        { name: "مضاد طفيليات",           icon: "🐛" },
  "liver":                { name: "أدوية الكبد",            icon: "🫀" },
  "supportive emollient for anorectal disorders": { name: "أدوية الشرج", icon: "💊" },
  "supports weight management programs": { name: "إدارة الوزن", icon: "⚖️" }
};

function findCategory(description) {
  if (!description) return null;
  const desc = description.toLowerCase().trim();
  // بحث مباشر
  if (CATEGORY_MAP[desc]) return CATEGORY_MAP[desc];
  // بحث جزئي
  for (const key of Object.keys(CATEGORY_MAP)) {
    if (desc.includes(key) || key.includes(desc)) return CATEGORY_MAP[key];
  }
  return null;
}

function buildCategorySection(drug) {
  const cat = findCategory(drug.description);
  if (!cat) return '';
  const appUrl = `https://infopharmprice.blogspot.com/?category=${encodeURIComponent(drug.description || '')}`;
  return `
  <div class="category-box">
    <div class="cat-title">📂 تصفح أدوية مشابهة</div>
    <a href="${appUrl}" class="cat-btn">
      <span class="cat-icon">${cat.icon}</span>
      <span>${cat.name}</span>
      <span class="cat-arrow">←</span>
    </a>
  </div>`;
}

// ── البحث عن indications بالمادة الفعالة ──
function findIndication(active) {
  if (!active) return null;
  const key = active.toLowerCase().trim();
  // بحث مباشر
  for (const k of Object.keys(indications)) {
    if (k.toLowerCase().trim() === key) return indications[k];
  }
  // بحث جزئي — لو المادة الفعالة تحتوي على الـ key أو العكس
  for (const k of Object.keys(indications)) {
    if (key.includes(k.toLowerCase().trim()) || k.toLowerCase().trim().includes(key)) {
      return indications[k];
    }
  }
  return null;
}

// ── بناء قسم الـ indications ──
function buildIndicationsSection(drug, ind) {
  if (!ind) return '';

  const dosageForm = (drug.dosage_form || 'default').toLowerCase();
  const usage = ind.usage
    ? (ind.usage[dosageForm] || ind.usage['default'] || '')
    : '';
  const safety = ind.safety || {};

  let html = '';

  if (usage) {
    html += `
    <div class="card">
      <div class="section">
        <h2>💊 دواعي الاستعمال</h2>
        <p>${safeHtml(usage)}</p>
      </div>
    </div>`;
  }

  const hasSafety = safety.contra || safety.preg || safety.lact;
  if (hasSafety) {
    html += `<div class="card"><div class="section">
      <h2>⚠️ معلومات السلامة</h2>`;

    if (safety.contra) {
      html += `
      <div class="safety-block contra">
        <div class="safety-title">🚫 موانع الاستعمال</div>
        <p>${safeHtml(safety.contra)}</p>
      </div>`;
    }

    if (safety.preg) {
      html += `
      <div class="safety-block preg">
        <div class="safety-title">🤰 الحمل — تصنيف ${escHtml(safety.preg)}</div>
        ${safety.pregNote ? `<p>${safeHtml(safety.pregNote)}</p>` : ''}
      </div>`;
    }

    if (safety.lact) {
      html += `
      <div class="safety-block lact">
        <div class="safety-title">🍼 الرضاعة — درجة ${escHtml(safety.lact)}</div>
      </div>`;
    }

    html += `</div></div>`;
  }

  return html;
}

// ── تحذيرات خاصة بالشكل الدوائي ──
function buildDosageWarnings(drug) {
  const form = (drug.dosage_form || '').toLowerCase();
  const needsTest = drug.needsTest === true || drug.needsTest === 'true';
  let html = '';

  // تحذير قطرات العين
  if (form === 'eye drops') {
    html += `
    <div class="warning-box">
      <div class="w-title">⏰ تحذير هيئة الدواء المصرية</div>
      <p>قطرات العين صالحة للاستخدام لمدة <strong>شهر واحد فقط</strong> من تاريخ فتح العبوة، ويجب التخلص منها بعد ذلك حتى لو لم تنته الكمية.</p>
    </div>`;
  }

  // تحذير اختبار الحساسية للحقن
  if (form === 'vial' || form === 'amp' || form === 'ampoule' || 
      form === 'injection' || form === 'i.v.' || form === 'i.m.' ||
      needsTest) {
    html += `
    <div class="danger-box">
      <div class="w-title">🚨 تحذير مهم — اختبار الحساسية</div>
      <p>هذا الدواء يُعطى عن طريق الحقن ويتطلب <strong>إجراء اختبار حساسية قبل الحقن</strong>. يجب أن يتم تحت إشراف طبي متخصص في مكان مجهز للتعامل مع ردود الفعل التحسسية.</p>
    </div>`;
  }

  return html;
}

// ── Template HTML ──
function buildPage(drug, slug) {
  const price   = parseFloat(drug.price) || 0;
  const unitP   = drug.units > 1 ? (price / drug.units).toFixed(2) : null;
  const dateStr = formatDate(drug.Date_updated);
  const appUrl  = `https://infopharmprice.blogspot.com/?drug=${encodeURIComponent(drug.name)}`;
  const ind     = findIndication(drug.active);

  // Description أغنى لو عندنا indications
  const dosageForm = (drug.dosage_form || 'default').toLowerCase();
  const usageText  = ind && ind.usage
    ? (ind.usage[dosageForm] || ind.usage['default'] || '')
    : '';
  const metaDesc = usageText
    ? `${escHtml(drug.name)} — ${usageText.replace(/<[^>]+>/g,'').slice(0,100)}. السعر: ${price} ج.م`
    : `سعر ${escHtml(drug.name)} في مصر ${price} جنيه. المادة الفعالة: ${escHtml(drug.active)}. شركة: ${escHtml(drug.company)}.`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escHtml(drug.name)} | سعر الدواء في مصر - Infopharm</title>
<meta name="description" content="${metaDesc}"/>
<meta name="keywords" content="${escHtml(drug.name)}, ${escHtml(drug.active)}, سعر دواء, أدوية مصر"/>
<link rel="canonical" href="https://infopharmsoft-dotcom.github.io/infopharm/drug/${slug}/"/>
<meta property="og:title" content="${escHtml(drug.name)} | Infopharm"/>
<meta property="og:description" content="${metaDesc}"/>
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
.safety-block{background:var(--bg);border-radius:10px;padding:12px 14px;margin-bottom:10px;}
.safety-block.contra{border-right:4px solid var(--red);}
.safety-block.preg{border-right:4px solid #FF9800;}
.safety-block.lact{border-right:4px solid #9C27B0;}
.safety-title{font-size:13px;font-weight:700;margin-bottom:6px;color:var(--txt);}
.safety-block p{font-size:13px;color:var(--txt2);line-height:1.6;margin:0;}
.cta-wrap{display:flex;flex-direction:column;gap:10px;padding:0 12px 16px;}
.btn-app{display:flex;align-items:center;justify-content:center;gap:8px;background:var(--blue);color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:700;box-shadow:0 3px 8px rgba(25,118,210,.35);}
.btn-iherb{display:flex;align-items:center;justify-content:center;gap:8px;background:#6CC04A;color:#fff;padding:14px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:700;}
.btn-iherb small{font-size:11px;opacity:.9;font-weight:400;}
.date-badge{text-align:center;font-size:11px;color:var(--txt2);padding:8px;background:var(--bg);}
.breadcrumb{font-size:12px;color:var(--txt2);margin-bottom:12px;}
.breadcrumb a{color:var(--blue);text-decoration:none;}
.info-box{border-radius:12px;padding:14px 16px;margin-bottom:14px;}
.info-box.blue{background:#E3F2FD;border:1px solid #90CAF9;}
.info-box.yellow{background:#FFF8E1;border:1px solid #FFD54F;}
.info-box.purple{background:#F3E5F5;border:1px solid #CE93D8;}
.info-box .box-title{font-size:13px;font-weight:700;margin-bottom:6px;color:var(--txt);}
.info-box p{font-size:13px;color:var(--txt2);line-height:1.7;margin:0;}
.keywords{font-size:12px;color:var(--txt2);line-height:1.8;}
.category-box{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:16px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,.1);}
.cat-title{font-size:13px;font-weight:700;color:var(--txt2);margin-bottom:10px;}
.cat-btn{display:flex;align-items:center;gap:10px;background:var(--blue-l);border:1px solid #90CAF9;border-radius:12px;padding:12px 16px;text-decoration:none;color:var(--blue);font-weight:700;font-size:15px;}
.cat-icon{font-size:24px;}
.cat-arrow{margin-right:auto;font-size:18px;}
.warning-box{background:#FFF3E0;border:1px solid #FF9800;border-right:4px solid #FF9800;border-radius:12px;padding:14px 16px;margin-bottom:14px;}
.warning-box .w-title{font-size:13px;font-weight:700;color:#E65100;margin-bottom:6px;}
.warning-box p{font-size:13px;color:#BF360C;line-height:1.7;margin:0;}
.danger-box{background:#FFEBEE;border:1px solid #F44336;border-right:4px solid #F44336;border-radius:12px;padding:14px 16px;margin-bottom:14px;}
.danger-box .w-title{font-size:13px;font-weight:700;color:#B71C1C;margin-bottom:6px;}
.danger-box p{font-size:13px;color:#C62828;line-height:1.7;margin:0;}
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
    <a href="https://infopharmprice.blogspot.com">الرئيسية</a> ← ${escHtml(drug.dosage_form || 'دواء')} ← ${escHtml(drug.name)}
  </div>

  <div class="card">
    <div class="price-hero">
      <div class="drug-name">${escHtml(drug.name)}</div>
      ${drug.arabic ? `<div class="drug-arabic">${escHtml(drug.arabic)}</div>` : ''}
      <div class="price-val">${price.toFixed(2)}</div>
      <div class="price-sub">جنيه مصري ${priceChange(drug.oldprice, drug.price)}</div>
      ${unitP ? `<div class="price-sub" style="margin-top:8px;font-size:12px;">سعر الوحدة: ${unitP} ج.م</div>` : ''}
    </div>

    <div class="info-grid">
      ${drug.active ? `<div class="info-cell"><div class="lbl">المادة الفعالة</div><div class="val" style="font-size:12px;">${escHtml(drug.active)}</div></div>` : ''}
      ${drug.company ? `<div class="info-cell"><div class="lbl">الشركة المنتجة</div><div class="val" style="font-size:12px;">${escHtml(drug.company)}</div></div>` : ''}
      ${drug.dosage_form ? `<div class="info-cell"><div class="lbl">الشكل الدوائي</div><div class="val">${escHtml(drug.dosage_form)}</div></div>` : ''}
      ${drug.units ? `<div class="info-cell"><div class="lbl">عدد الوحدات</div><div class="val">${escHtml(drug.units)}</div></div>` : ''}
    </div>

    ${drug.details ? `<div class="section"><h2>📋 تفاصيل الدواء</h2><p>${escHtml(drug.details)}</p></div>` : ''}
    ${drug.description ? `<div class="section"><h2>📂 التصنيف</h2><p>${escHtml(drug.description)}</p></div>` : ''}
    <div class="date-badge">📅 آخر تحديث للسعر: ${dateStr}</div>
  </div>

  ${buildIndicationsSection(drug, ind)}
  ${buildDosageWarnings(drug)}

  ${buildCategorySection(drug)}

  <!-- معلومات + إخلاء مسؤولية + كلمات مفتاحية -->
  <div class="info-box blue">
    <div class="box-title">📌 معلومات عن هذا المنتج:</div>
    <p>سعر دواء <strong>${escHtml(drug.arabic || drug.name)}</strong> هو <strong>${price.toFixed(0)} جنيه مصري</strong>${drug.company ? ` من إنتاج شركة <strong>${escHtml(drug.company)}</strong>` : ''}${dateStr ? `. تم آخر تحديث للسعر في ${dateStr}` : ''}.</p>
  </div>

  <div class="info-box yellow">
    <div class="box-title">⚠️ إخلاء مسؤولية:</div>
    <p>مؤشر أسعار Infopharm Pro مخصص لعرض البيانات والأسعار التجارية ومساندة القرار الصيدلي الاسترشادي وفقاً للملفات المتاحة؛ لا يغني التطبيق عن الفحص الطبي والتشخيص المتخصص وعليك مراجعة الطبيب دائماً.</p>
  </div>

  <div class="info-box purple">
    <div class="box-title">🔑 كلمات مفتاحية:</div>
    <p class="keywords">${escHtml(drug.name)}${drug.arabic ? ', ' + escHtml(drug.arabic) : ''}${drug.company ? ', ' + escHtml(drug.company) : ''}, سعر ${escHtml(drug.name)}, Infopharm Pro, أسعار الأدوية 2026 مصر</p>
  </div>

  <div class="cta-wrap">
    <a href="${appUrl}" class="btn-app">🔍 ابحث عن البدائل والمثيلات في التطبيق</a>
    <a href="${iherbLink(drug)}" class="btn-iherb" target="_blank" rel="noopener">
      🛒 اشتري المكملات والفيتامينات من iHerb
      <small>(شحن لمصر)</small>
    </a>
  </div>

</div>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Drug",
  "name": "${escHtml(drug.name)}",
  "alternateName": "${escHtml(drug.arabic || '')}",
  "activeIngredient": "${escHtml(drug.active || '')}",
  "manufacturer": {"@type":"Organization","name":"${escHtml(drug.company || '')}"},
  "offers": {"@type":"Offer","price":"${price}","priceCurrency":"EGP","availability":"https://schema.org/InStock"}
}
</script>

</body>
</html>`;
}

// ── توليد الصفحات ──
let count = 0;
const slugMap = {};

for (const drug of drugs) {
  if (!drug.name) continue;
  let slug = slugify(drug.name);
  if (slugMap[slug]) { slugMap[slug]++; slug = `${slug}-${slugMap[slug]}`; }
  else { slugMap[slug] = 1; }
  const dir = path.join(DRUGS_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(drug, slug), 'utf8');
  count++;
  if (count % 1000 === 0) console.log(`⏳ ${count} / ${drugs.length}`);
}

// ── index الرئيسية ──
const indexHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Infopharm Pro | دليل أسعار الأدوية في مصر</title>
<meta name="description" content="دليل شامل لأسعار ${drugs.length.toLocaleString()} دواء في مصر."/>
<link rel="canonical" href="https://infopharmsoft-dotcom.github.io/infopharm/"/>
<meta name="google-site-verification" content="8VaHhORs2kWN8gHYegdOOGHKn8ZypKAwJ8_i924trV8"/>
<meta http-equiv="refresh" content="0;url=https://infopharmprice.blogspot.com"/>
</head>
<body><p>جاري التحويل للتطبيق...</p></body>
</html>`;

fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(DIST, 'google47c6bdf791ecbc38.html'), 'google-site-verification: google47c6bdf791ecbc38.html', 'utf8');

console.log(`\n🎉 تم توليد ${count} صفحة بنجاح!`);
