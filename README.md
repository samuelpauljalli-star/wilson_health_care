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
