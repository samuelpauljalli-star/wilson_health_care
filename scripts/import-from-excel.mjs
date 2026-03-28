/**
 * import-from-excel.mjs
 * Reads products-tripled.xlsx → regenerates data.js
 * 
 * SMART MERGE:
 * If an image is missing in Excel, it attempts to keep the existing image from data.js.
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const XLSX_FILE = path.join(ROOT, 'products-tripled.xlsx');
const DATA_FILE = path.join(ROOT, 'data.js');

// ── 1. Read existing data.js (to preserve images) ─────────────────────────────
function loadExistingProducts() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const src = fs.readFileSync(DATA_FILE, 'utf8');
        const ctx = vm.createContext({ window: {}, document: {}, console });
        vm.runInContext(src, ctx);
        return ctx.window.products || [];
    } catch (e) {
        console.warn('⚠️  Could not parse existing data.js for image fallback');
        return [];
    }
}

const existingProducts = loadExistingProducts();
const imageCache = new Map(existingProducts.map(p => [p.id, { image: p.image, images: p.images }]));

// ── 2. Read workbook ──────────────────────────────────────────────────────────
if (!fs.existsSync(XLSX_FILE)) {
    console.error(`❌  File not found: ${XLSX_FILE}`);
    process.exit(1);
}

const workbook = XLSX.readFile(XLSX_FILE);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`📄  Sheet: "${sheetName}" — ${rows.length} rows found`);

// ── 3. Map rows → product objects ─────────────────────────────────────────────
const products = rows.map((row, i) => {
    const n = (val, fallback = 0) => {
        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? fallback : num;
    };

    const id = n(row['ID'], i + 1);
    
    // IMAGE FALLBACK LOGIC
    let imgMain = String(row['Image URL'] || '').trim();
    let imgExtraStr = String(row['Extra Images'] || '').trim();
    
    // If Excel is missing images, try to restore from cache
    if (!imgMain && imageCache.has(id)) {
        imgMain = imageCache.get(id).image;
    }
    
    let allImages = imgExtraStr
        ? imgExtraStr.split('|').map(s => s.trim()).filter(Boolean)
        : [];
        
    if (!imgExtraStr && !allImages.length && imageCache.has(id)) {
        allImages = imageCache.get(id).images || [];
    }

    if (imgMain && !allImages.includes(imgMain)) {
        allImages.unshift(imgMain);
    }

    const product = {
        id: id,
        name: String(row['Name'] || '').trim() || `Product ${id}`,
        category: String(row['Category'] || '').trim() || 'General',
        price: n(row['Price (Rs)'], 0),
        oldPrice: n(row['Old Price (Rs)'], 0),
        gst: n(row['GST (%)'], 0),
        discount: String(row['Discount'] || '').trim(),
        rating: String(row['Rating'] || '4.0').trim(),
        ratingCount: n(row['Rating Count'] || row['Rating members'], 50),
        tag: String(row['Tag'] || '').trim(),
        desc: String(row['Description'] || '').trim(),
        usage: String(row['Usage'] || '').trim(),
        warranty: String(row['warenty'] || row['Warranty'] || row['warranty'] || '').trim(),
        image: imgMain,
    };

    if (allImages.length > 0) product.images = allImages;
    return product;
});

console.log(`✅  Mapped ${products.length} products (with image fallback)`);

// ── 4. Build data.js ──────────────────────────────────────────────────────────
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

