# 🏥 Wilson Health Care - Premium Medical Solutions Platform

![Wilson Health Care Logo](logo.jpg)

Wilson Health Care is a state-of-the-art, fully-integrated medical equipment e-commerce platform. Designed for hospitals, clinics, and professional healthcare providers, it offers a seamless blend of high-performance medical technology and a premium digital shopping experience.

---

## 💎 Project Philosophy & Aesthetics

This platform is built with a focus on **Rich Aesthetics** and **Visual Excellence**. It utilizes:
- **Glassmorphism & Radial Gradients**: For a modern, premium look and feel.
- **Dynamic Animations**: Custom micro-animations (3D icon rotations, entrance effects, and scroll-reveals) that make the interface feel alive.
- **Premium Typography**: High-legibility fonts (Inter, Montserrat, Playfair Display) tailored for professional medical branding.
- **Advanced Mobile UX**: A tailored mobile experience with a dedicated bottom navigation bar for effortless interaction on any device.

---

## 🚀 Key Features

### 🛒 High-Performance E-commerce
*   **Dynamic Product Catalog**: Real-time inventory powered by Firebase Firestore with advanced sorting and filtering (Price, Rating, Discounts).
*   **Advanced Product Discovery**: Instant search bar with deep-linking support.
*   **Premium Interactive Details**: High-resolution image viewers, detailed specifications, and related product recommendations.

### 🔐 Secure Integrated Backend
*   **One-Touch Google Auth**: Secure Google authentication for both customers and administrators.
*   **Firebase Integration**: Real-time data synchronization between the website and the cloud database.
*   **Live Admin Panel**: A secure workspace (`peter.html`) for managing orders, inventory, and analytics.

### 📦 Seamless Fulfillment
*   **WhatsApp Booking Engine**: A refined order flow that packages order details and user addresses into a professional WhatsApp request for instant fulfillment.
*   **Order Tracking**: Persistent history for users to track their past medical equipment purchases.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | HTML5, Modern CSS3, Vanilla JavaScript (ES Module-based) |
| **Database** | Firebase Firestore (NoSQL, Real-time) |
| **Authentication** | Firebase Google Authentication |
| **Hosting & CI/CD** | Vercel (Production), Webpack (Development) |
| **Analytics** | Firebase Google Analytics |

---

## 📂 Project Structure

```
wilson_health_care/
│
├── 📄 index.html                  # Main storefront — product catalog & homepage
├── 📄 style.css                   # Global styles, design tokens & animations
├── 📄 main.js                     # Core frontend logic (cart, search, filters, UI)
│
├── 📄 product-detail.html         # Individual product detail page
├── 📄 product-detail.css          # Styles specific to the product detail page
├── 📄 product-detail.js           # JS logic for product detail (specs, gallery, CTAs)
│
├── 📄 peter.html                  # 🔒 Admin dashboard (orders, revenue, analytics)
├── 📄 product-manager.html        # 🔒 Admin product manager (add/edit/delete inventory)
├── 📄 sync-firebase.html          # 🔒 Manual Firebase data sync utility page
├── 📄 upload_products.html        # 🔒 Bulk product upload utility page
│
├── 📄 invoice.html                # Printable order invoice page
├── 📄 chatbot.html                # AI chatbot interface page
├── 📄 404.html                    # Custom 404 error page
│
├── 📄 auth.js                     # Admin Firebase authentication logic
├── 📄 customer-auth.js            # Customer-facing authentication logic
├── 📄 firebase-config.js          # Firebase project configuration & SDK init
├── 📄 data.js                     # Static product data fallback (offline/Firestore backup)
│
├── 📄 service-worker.js           # PWA service worker (offline caching)
├── 📄 manifest.json               # PWA web app manifest (icons, theme, display mode)
│
├── 📄 vercel.json                 # Vercel deployment & routing configuration
├── 📄 package.json                # NPM dependencies & build scripts
├── 📄 webpack.config.js           # Webpack bundler configuration
├── 📄 rollup.config.js            # Rollup bundler configuration (alternative build)
│
├── 📄 products-tripled.xlsx       # Excel source file for product data
├── 📄 logo.jpg                    # Wilson Health Care brand logo
├── 📄 firestore_rules.txt         # Firebase Firestore security rules
│
├── 📁 scripts/                    # Node.js utility scripts (run via npm)
│   ├── export-to-excel.mjs        # Export Firestore products → Excel
│   ├── import-from-excel.mjs      # Import products from Excel → Firestore
│   ├── sync-to-firebase.mjs       # Sync local product data to Firestore
│   ├── triple-products.mjs        # Triples product entries for data generation
│   └── watch-excel.mjs            # Watch Excel file & auto-sync on changes
│
├── 📁 dist/                       # Webpack build output (auto-generated)
│   ├── bundle.js                  # Compiled & minified JS bundle
│   └── bundle.js.LICENSE.txt      # Third-party license notices
│
├── 📁 node_modules/               # NPM dependencies (auto-generated, not committed)
├── 📄 .gitignore                  # Git ignored files & folders
│
├── 📄 README.md                   # Project overview & documentation (this file)
├── 📄 README_FIREBASE.md          # Firebase setup & integration guide
├── 📄 AUTH_SUMMARY.md             # Authentication architecture summary
└── 📄 CUSTOMER_AUTH_GUIDE.md      # Customer authentication user guide
```

---

## 📂 Deployment & Maintenance

### 1. One-Click Vercel Deployment
This project is optimized for Vercel. 
1. Push your code to a GitHub/GitLab repository.
2. Link the repository to your [Vercel Dashboard](https://vercel.com).
3. Vercel will automatically detect the `package.json` and `vercel.json` for a zero-config deployment.

### 2. Large Commit Warning (Vercel/GitHub UI)
If you see the message *"Some content is hidden: Large Commits have some content hidden by default"* in the Vercel or GitHub UI, **this is normal.** It means the `index.html` file is quite large due to the high-density feature set. Your code is **fully deployed and working**; the UI simply hides part of the "diff" view to optimize performance.

---

## 👨‍💻 Administrative Management
Authorized administrators (`samuelpauljalli@gmail.com`, `wilsonhealthcare7@gmail.com`) can access:
- **PETER Dashboard** (`/peter.html`): View revenue stats, order counts, and user growth.
- **Product Manager** (`/product-manager.html`): Update prices and add new inventory in real-time.

---

**Developed for Wilson Health Care** 🏥  
*Delivering the Future of Medical Technology.*
