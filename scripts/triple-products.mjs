/**
 * Wilson Health Care — Triple Products + Shuffle Images
 * Run: npm run excel:triple
 *
 * Reads products-tripled.xlsx (the main editable file), then for each product creates 3 copies with:
 *  - Sequential IDs (1, 2, 3, 4 … N×3)
 *  - Same name, price, category, rating, desc, tag, gst, usage
 *  - Images from the SAME product shuffled differently for each copy
 *
 * Writes both products-tripled.xlsx AND data.js.
 */

import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const DATA_JS = path.join(ROOT, 'data.js');
const XLS = path.join(ROOT, 'products-tripled.xlsx');   // source (read)
const XLS_OUT = path.join(ROOT, 'products-tripled.xlsx'); // output (write)

// ─── Read current products.xlsx ───────────────────────────────────────────────
function loadFromExcel() {
    const wb = XLSX.readFile(XLS);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    return rows.map(row => ({
        id: Number(row['ID'] || row['id'] || 0),
        name: String(row['Name'] || row['name'] || '').trim(),
        category: String(row['Category'] || row['category'] || '').trim(),
        price: parseFloat(row['Price (Rs)'] || row['price'] || 0) || 0,
        oldPrice: parseFloat(row['Old Price (Rs)'] || row['oldPrice'] || 0) || 0,
        gst: parseFloat(row['GST (%)'] || row['gst'] || 0) || 0,
        discount: String(row['Discount'] || row['discount'] || '').trim(),
        rating: String(row['Rating'] || row['rating'] || '4.0').trim(),
        ratingCount: parseInt(row['Rating Count'] || row['ratingCount'] || 50) || 50,
        tag: String(row['Tag'] || row['tag'] || '').trim(),
        desc: String(row['Description'] || row['desc'] || '').trim(),
        usage: String(row['Usage'] || row['usage'] || '').trim(),
        image: String(row['Image URL'] || row['image'] || '').trim(),
        images: String(row['Extra Images'] || '').split('|').map(s => s.trim()).filter(Boolean),
    }));
}

// ─── Shuffle array (Fisher-Yates) ────────────────────────────────────────────
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Generate 3 image variants for a product ─────────────────────────────────
function makeImageVariants(product) {
    // Pool all unique, non-empty image URLs from this product
    const pool = [...new Set(
        [product.image, ...product.images].map(u => (u || '').trim()).filter(Boolean)
    )];

    if (pool.length === 0) {
        return [{ image: '', images: [] }, { image: '', images: [] }, { image: '', images: [] }];
    }

    if (pool.length === 1) {
        return [
            { image: pool[0], images: [pool[0]] },
            { image: pool[0], images: [pool[0]] },
            { image: pool[0], images: [pool[0]] },
        ];
    }

    // Generate 3 shuffled variants — try to give each a different leading image
    const variants = [];
    const usedLeaders = new Set();

    for (let tries = 0; variants.length < 3 && tries < 50; tries++) {
        const shuffled = shuffle(pool);
        const leader = shuffled[0];
        if (!usedLeaders.has(leader) || usedLeaders.size >= pool.length) {
            usedLeaders.add(leader);
            variants.push({ image: leader, images: shuffled });
        }
    }

    // Safety: fill remaining copies if we couldn't get 3 unique leaders
    while (variants.length < 3) {
        const shuffled = shuffle(pool);
        variants.push({ image: shuffled[0], images: shuffled });
    }

    return variants.slice(0, 3);
}

// ─── Triple the products list ────────────────────────────────────────────────
function tripleProducts(originals) {
    const result = [];
    let newId = 1;

    for (const p of originals) {
        const variants = makeImageVariants(p);
        for (let v = 0; v < 3; v++) {
            result.push({
                id: newId++,
                name: p.name,
                category: p.category,
                price: p.price,
                oldPrice: p.oldPrice,
                gst: p.gst,
                discount: p.discount,
                rating: p.rating,
                ratingCount: p.ratingCount,
                tag: p.tag,
                desc: p.desc,
                usage: p.usage,
                image: variants[v].image,
                images: variants[v].images,
            });
        }
    }
    return result;
}

// ─── Write products.xlsx ──────────────────────────────────────────────────────
function writeExcel(products) {
    const rows = products.map(p => ({
        'ID': p.id,
        'Name': p.name,
        'Category': p.category,
        'Price (Rs)': p.price,
        'Old Price (Rs)': p.oldPrice,
        'GST (%)': p.gst,
        'Discount': p.discount,
        'Rating': p.rating,
        'Rating Count': p.ratingCount,
        'Tag': p.tag,
        'Description': p.desc,
        'Usage': p.usage,
        'Image URL': p.image,
        'Extra Images': (p.images || []).join('|'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
        { wch: 6 }, { wch: 42 }, { wch: 20 }, { wch: 14 }, { wch: 15 }, { wch: 9 },
        { wch: 13 }, { wch: 9 }, { wch: 13 }, { wch: 18 }, { wch: 55 }, { wch: 40 },
        { wch: 65 }, { wch: 100 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, XLS_OUT);
}

// ─── Write data.js ────────────────────────────────────────────────────────────
function writeDataJs(products) {
    const ts = new Date().toLocaleString('en-IN', { hour12: true });

    const lines = products.map(p => {
        const f = [
            `id: ${p.id}`,
            `name: ${JSON.stringify(p.name)}`,
            `category: ${JSON.stringify(p.category)}`,
            `price: ${p.price}`,
            `oldPrice: ${p.oldPrice}`,
            `gst: ${p.gst}`,
            `discount: ${JSON.stringify(p.discount)}`,
            `rating: ${JSON.stringify(p.rating)}`,
            `ratingCount: ${p.ratingCount}`,
            `tag: ${JSON.stringify(p.tag)}`,
            `desc: ${JSON.stringify(p.desc)}`,
            `image: ${JSON.stringify(p.image)}`,
            p.usage ? `usage: ${JSON.stringify(p.usage)}` : null,
            p.images && p.images.length
                ? `images: ${JSON.stringify(p.images)}` : null,
        ].filter(Boolean).join(',\n        ');
        return `    {\n        ${f}\n    }`;
    });

    const code =
        `// Wilson Health Care — Product Data\n` +
        `// Auto-generated (tripled) on ${ts}\n` +
        `// Total: ${products.length} products\n\n` +
        `const products = [\n` +
        lines.join(',\n') +
        `\n];\n\n` +
        `window.products = products;\n`;

    fs.writeFileSync(DATA_JS, code, 'utf8');
}

console.log('Reading products.xlsx …');
const originals = loadFromExcel();
console.log(`  Found ${originals.length} original products`);

console.log('Creating 3 copies of each product with shuffled images …');
const tripled = tripleProducts(originals);
console.log(`  → ${tripled.length} products total (IDs 1–${tripled.length})`);

console.log('Writing data.js …');
writeDataJs(tripled);
console.log('  ✓ data.js updated');

console.log('Writing products-tripled.xlsx …');
writeExcel(tripled);
console.log('  ✓ products-tripled.xlsx saved');

console.log('');
console.log('✅  All done!');
console.log(`   Total products : ${tripled.length}`);
console.log(`   ID range       : 1 → ${tripled.length}`);
console.log('');
console.log('Next steps:');
console.log('  1. Open products-tripled.xlsx in Excel to review the tripled list');
console.log('  2. Run npm run excel:watch to auto-sync any future edits to data.js');
console.log('');
console.log('Sample (first 9 — 3 copies of first 3 originals):');
tripled.slice(0, 9).forEach(p =>
    console.log(`  [${String(p.id).padStart(3)}] ${p.name.substring(0, 30).padEnd(30)} | img: …${p.image.slice(-50)}`)
);
