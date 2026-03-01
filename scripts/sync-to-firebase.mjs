/**
 * sync-to-firebase.mjs
 * Reads products-tripled.xlsx → uploads ALL products to Firebase Firestore
 *
 * Uses Firebase REST API with your project credentials (no Admin SDK needed).
 * Usage:  node scripts/sync-to-firebase.mjs
 * Or:     npm run firebase:sync
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

// ── Firebase config (from firebase-config.js) ──────────────────────────────
const PROJECT_ID = 'wilson-health-care';
const API_KEY = 'AIzaSyCh5w0Vljp-7dV_Ui_8gTXj_WKF5TyEToA';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── 1. Read Excel ──────────────────────────────────────────────────────────
if (!fs.existsSync(XLSX_FILE)) {
    console.error(`❌  File not found: ${XLSX_FILE}`);
    process.exit(1);
}

const workbook = XLSX.readFile(XLSX_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`📄  Sheet: "${workbook.SheetNames[0]}" — ${rows.length} rows found`);

// ── 2. Map rows → product objects ──────────────────────────────────────────
const n = (val, fallback = 0) => {
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? fallback : num;
};

const products = rows.map((row, i) => {
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
        image: imgMain,
        images: allImages,
    };
    return product;
});

console.log(`✅  Mapped ${products.length} products\n`);

// ── 3. Convert JS value → Firestore field value ────────────────────────────
function toFirestoreValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') return { doubleValue: val };
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
    if (typeof val === 'object') {
        const fields = {};
        for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
        return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
    return fields;
}

// ── 4. Upload to Firestore via REST API ─────────────────────────────────────
async function upsertProduct(product) {
    const docId = String(product.id);
    const url = `${FIRESTORE_URL}/products/${docId}?key=${API_KEY}`;
    const body = JSON.stringify({ fields: toFirestoreFields(product) });

    const res = await fetch(url, {
        method: 'PATCH',   // PATCH = create or overwrite
        headers: { 'Content-Type': 'application/json' },
        body,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
    }
    return res.json();
}

// ── 5. Batch upload with progress ─────────────────────────────────────────
const BATCH_SIZE = 20;   // parallel uploads per batch
let uploaded = 0;
let failed = 0;
const errors = [];

console.log(`🚀  Uploading ${products.length} products to Firestore (${BATCH_SIZE} at a time)...\n`);

for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(p => upsertProduct(p)));

    results.forEach((r, idx) => {
        const p = batch[idx];
        if (r.status === 'fulfilled') {
            uploaded++;
            process.stdout.write(`  ✅ [${p.id}] ${p.name}\n`);
        } else {
            failed++;
            const msg = `  ❌ [${p.id}] ${p.name} — ${r.reason.message}`;
            errors.push(msg);
            process.stdout.write(msg + '\n');
        }
    });

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < products.length) {
        await new Promise(r => setTimeout(r, 300));
    }
}

// ── 6. Summary ─────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log(`🎉  Done! Uploaded: ${uploaded} | Failed: ${failed}`);
if (errors.length > 0) {
    console.log('\n❌  Errors:');
    errors.forEach(e => console.log(e));
}
console.log('─'.repeat(50));
console.log('\n✅  Firebase Firestore is now synced with products-tripled.xlsx!');
