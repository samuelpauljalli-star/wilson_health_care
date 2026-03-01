# 🏥 Wilson Health Care

A premium, fully-integrated medical equipment e-commerce platform built with modern web standards and Firebase real-time integration. This platform features institutional-grade medical products, a seamless checkout experience via WhatsApp, and a sophisticated administrative dashboard for inventory and order management.

---

## 🌟 Key Features

*   **Premium E-commerce UI**: Modern, responsive design optimized for medical professionals and institutional buyers.
*   **Google Authentication**: Exclusive, secure sign-in system for both users and administrators.
*   **Live Inventory Management**: A real-time product manager for updating prices, categories, and descriptions.
*   **Order Tracking & History**: Transparent order flows with persistent user history.
*   **WhatsApp Booking**: Integrated order confirmation flow that sends detailed booking requests directly to the sales team.
*   **Firebase Backend**: Leverages Firestore for data, Authentication for security, and Analytics for insights.
*   **Admin Dashboard**: Secure control panel for authorized developers and staff.

---

## 🛠️ Technology Stack

*   **Core**: HTML5, Vanilla JavaScript (ES Module-based)
*   **Design**: Modern CSS3 with a premium aesthetic (Glassmorphism, Animations)
*   **Backend**: 
    *   **Firebase Firestore**: Real-time NoSQL Database
    *   **Firebase Authentication**: Google Social Authentication
    *   **Firebase Analytics**: User activity tracking
*   **Dev Tools**: 
    *   **Webpack**: For development server and bundling
    *   **Vercel**: For high-performance cloud hosting

---

## 🚀 Deployment Guide

### 1. GitHub Setup
Initialize your repository and push to GitHub to enable seamless CI/CD.

```bash
# Update .gitignore and stage files
git add .
git commit -m "📦 Initial Commit: Prepared for Vercel deployment"

# Link to your GitHub repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/wilson-health-care.git
git branch -M main
git push -u origin main
```

### 2. Vercel Integration
Deploying to Vercel is instantaneous once your code is on GitHub.

1.  Log in to [Vercel](https://vercel.com).
2.  Click **"New Project"**.
3.  Import the **`wilson-health-care`** repository.
4.  Vercel will automatically detect the `vercel.json` configuration.
5.  Click **"Deploy"**.

Your application will be live at a custom `.vercel.app` domain!

---

## 🔐 Administrative Access

The admin panel (`peter.html`) and sync tools are restricted to authorized accounts. To add a new administrator:
1.  Open `firestore_rules.txt` and add the authorized email.
2.  Update the `AUTHORIZED_EMAILS` array in `peter.html`, `sync-firebase.html`, and `product-manager.html`.

---

## 📂 Project Structure

*   `index.html`: Main landing and product catalog page.
*   `product-detail.html`: Individual product showcase and booking.
*   `peter.html`: Secured administrative dashboard.
*   `product-manager.html`: Live inventory editing tool.
*   `firebase-config.js`: Core Firebase initialization and exports.
*   `data.js`: Local fallback data and initial product seeds.
*   `sync-firebase.html`: Bulk data migration and sync dash.

---

## 🏗️ Local Development

To run the project locally with hot reloading:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:8080`.

---

**Developed for Wilson Health Care** 🏥  
*Delivering High-Performance Medical Solutions*
