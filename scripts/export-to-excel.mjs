/**
 * Wilson Health Care — Export Current Products → products-tripled.xlsx
 * Run: npm run excel:export
 *
 * Parses data.js with vm sandbox to extract the products array,
 * then writes products.xlsx in the project root.
 */

import path from 'path';
import fs from 'fs';
import vm from 'vm';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const DATA_JS = path.join(ROOT, 'data.js');
const OUT_XLS = path.join(ROOT, 'products-tripled.xlsx');

// ─── Parse data.js safely ────────────────────────────────────────────────────
function loadProducts() {
    let src = fs.readFileSync(DATA_JS, 'utf8');

    // Stub out browser globals so vm doesn't throw
    const ctx = vm.createContext({
        window: {}, document: {}, navigator: {}, console,
        setTimeout: () => { }, clearTimeout: () => { },
    });

    try {
        vm.runInContext(src, ctx, { timeout: 5000 });
    } catch (e) {
        throw new Error('Failed to eval data.js: ' + e.message);
    }

    if (!Array.isArray(ctx.window.products)) {
        throw new Error('`products` array not found in data.js (window.products)');
    }
    return ctx.window.products;
}

// ─── Build worksheet ──────────────────────────────────────────────────────────
function buildSheet(products) {
    const rows = products.map(p => ({
        'ID': p.id,
        'Name': p.name || '',
        'Category': p.category || '',
        'Price (Rs)': p.price || 0,
        'Old Price (Rs)': p.oldPrice || 0,
        'GST (%)': p.gst || 0,
        'Discount': p.discount || '',
        'Rating': p.rating || '',
        'Rating Count': p.ratingCount || 50,
        'Tag': p.tag || '',
        'Description': p.desc || '',
        'Usage': p.usage || '',
        'Image URL': p.image || '',
        'Extra Images': (p.images || []).join('|'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
        { wch: 8 }, { wch: 42 }, { wch: 20 }, { wch: 14 }, { wch: 15 }, { wch: 9 },
        { wch: 13 }, { wch: 9 }, { wch: 13 }, { wch: 18 }, { wch: 55 }, { wch: 40 },
        { wch: 65 }, { wch: 80 }
    ];
    return ws;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('Reading data.js …');
const products = loadProducts();
console.log(`Loaded ${products.length} products`);

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, buildSheet(products), 'Products');
XLSX.writeFile(wb, OUT_XLS);

console.log('');
console.log('SUCCESS! products-tripled.xlsx saved:');
console.log('  ' + OUT_XLS);
console.log('');
console.log('Next:');
console.log('  1. Open products-tripled.xlsx in Microsoft Excel');
console.log('  2. Edit any row (name, price, discount, image, etc.)');
console.log('  3. In a NEW terminal run:  npm run excel:watch');
console.log('  4. Every Ctrl+S in Excel instantly updates data.js!');
