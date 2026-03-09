/**
 * import-from-excel.mjs
 * Reads products-tripled.xlsx → regenerates data.js
 *
 * Columns in the sheet:
 *   ID | Name | Category | Price (Rs) | Old Price (Rs) | GST (%) |
 *   Discount | Rating | Rating members | Tag | Description | Usage |
 *   Image URL | Extra Images | warenty
 *
 * Usage:  node scripts/import-from-excel.mjs
 * Or:     npm run excel:import
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const XLSX_FILE = path.join(ROOT, 'products-tripled.xlsx');
const DATA_FILE = path.join(ROOT, 'data.js');

// ── 1. Read workbook ──────────────────────────────────────────────────────────
if (!fs.existsSync(XLSX_FILE)) {
    console.error(`❌  File not found: ${XLSX_FILE}`);
    process.exit(1);
}

const workbook = XLSX.readFile(XLSX_FILE);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`📄  Sheet: "${sheetName}" — ${rows.length} rows found`);
if (rows.length > 0) {
    console.log('📋  Columns detected:', Object.keys(rows[0]).join(' | '));
}

// ── 2. Map rows → product objects (exact column names from the sheet) ─────────
const products = rows.map((row, i) => {
    // Helper: get number safely
    const n = (val, fallback = 0) => {
        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? fallback : num;
    };

    const imgMain = String(row['Image URL'] || '').trim();
    const imgExtra = String(row['Extra Images'] || '').trim();
    const allImages = imgExtra
        ? imgExtra.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    if (imgMain && !allImages.includes(imgMain)) allImages.unshift(imgMain);

    const product = {
        id: n(row['ID'], i + 1),
        name: String(row['Name'] || '').trim() || `Product ${i + 1}`,
        category: String(row['Category'] || '').trim() || 'General',
        price: n(row['Price (Rs)'], 0),
        oldPrice: n(row['Old Price (Rs)'], 0),
        gst: n(row['GST (%)'], 0),
        discount: String(row['Discount'] || '').trim(),
        rating: String(row['Rating'] || '4.0').trim(),
        ratingCount: n(row['Rating members'], 50),
        tag: String(row['Tag'] || '').trim(),
        desc: String(row['Description'] || '').trim(),
        usage: String(row['Usage'] || '').trim(),
        warranty: String(row['warenty'] || row['Warranty'] || row['warranty'] || '').trim(),
        image: imgMain,
    };

    if (allImages.length > 0) product.images = allImages;
    return product;
});

console.log(`✅  Mapped ${products.length} products`);

// ── 3. Build data.js ──────────────────────────────────────────────────────────
const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

const content = [
    `// Wilson Health Care — Product Data`,
    `// Imported from products-tripled.xlsx on ${now}`,
    `// Total: ${products.length} products`,
    ``,
    `var products = ${JSON.stringify(products, null, 4)};`,
    ``,
    `// Make globally accessible for all browser scripts`,
    `window.products = products;`,
    ``
].join('\n');

fs.writeFileSync(DATA_FILE, content, 'utf8');

console.log(`\n🎉  data.js updated — ${products.length} products written to:`);
console.log(`    ${DATA_FILE}`);
console.log(`\nSample (first product):`);
console.log(JSON.stringify(products[0], null, 2));

// Quick stats
const categories = [...new Set(products.map(p => p.category))];
console.log(`\n📊  Categories (${categories.length}):`);
categories.forEach(cat => {
    const count = products.filter(p => p.category === cat).length;
    console.log(`    ${cat}: ${count} products`);
});
