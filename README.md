# Infopharm Static Pages

صفحات HTML ستاتيك لأرشفة جوجل — بتتولد تلقائياً من `drugs.json.gz`

---

## خطوات الإعداد (مرة واحدة بس)

### 1. إنشاء الـ Repository

- اعمل repo جديد على GitHub باسم `infopharm-static` (أو أي اسم)
- ارفع الملفات دي فيه:
  - `.github/workflows/generate.yml`
  - `generate.js`
  - `sitemap.js`
  - `package.json`

### 2. تفعيل GitHub Pages

- روح **Settings** → **Pages**
- في **Source** اختر: `Deploy from a branch`
- في **Branch** اختر: `gh-pages` → `/ (root)`
- اضغط **Save**

### 3. تفعيل صلاحيات الـ Action

- روح **Settings** → **Actions** → **General**
- في **Workflow permissions** اختر: `Read and write permissions`
- اضغط **Save**

### 4. غيّر كود الـ Affiliate

في ملف `generate.js` في السطر:
```js
const IHERB_CODE = 'YOURCODE';
```
غيّر `YOURCODE` بكودك من iHerb Associates

### 5. شغّل الـ Action

- روح **Actions** → **Generate Static Drug Pages**
- اضغط **Run workflow**
- استنى 10-15 دقيقة (25k صفحة بتاخد وقت)

### 6. ارفع الـ Sitemap في Search Console

بعد ما يخلص، روح Google Search Console وارفع:
```
https://infopharmprice.github.io/sitemap.xml
```

---

## التحديث التلقائي

**كل ما تعمل push للـ repo** — الـ Action بيشتغل تلقائي ويولد الصفحات من جديد.

لو محتاج تشغله يدوي: **Actions** → **Run workflow**

---

## هيكل الـ URLs الناتجة

```
https://infopharmprice.github.io/drug/jointedra-30-tablets/
https://infopharmprice.github.io/drug/near-slim-50-caps/
https://infopharmprice.github.io/drug/bivala-30-tabs/
```
