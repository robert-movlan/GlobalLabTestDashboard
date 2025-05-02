# 🚀 HOW TO DEPLOY (Firebase Hosting)

This guide explains how to deploy the **Global Lab Test Dashboard** React app to Firebase Hosting.

---

## ✅ Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js and npm installed
- Firebase project set up at [https://console.firebase.google.com](https://console.firebase.google.com)
- Logged in: `firebase login`

---

## 🧩 Project Structure

This project lives in:

/web-dashboard
├── public/
├── src/
├── build/ ← Auto-generated on build
└── firebase.json ← Configures hosting

yaml
Copy
Edit

---

## 🔄 Steps to Deploy

1. **Go to the project folder**  
cd web-dashboard

markdown
Copy
Edit

2. **Build the app**  
npm run build

markdown
Copy
Edit

3. **Deploy to Firebase**  
firebase deploy

yaml
Copy
Edit

You’ll receive a live URL after deploy.

---

## 💡 Notes

- To re-deploy after updates, repeat `build` and `firebase deploy`
- Hosting config is inside `firebase.json`
- If initializing from scratch, run:
firebase init hosting

yaml
Copy
Edit

---

## 🔗 Current Live Link

👉 [https://global-lab-test-dashboard.web.app](https://global-lab-test-dashboard.web.app)

---

## ✉️ Contact

**Movlan Aliyev**  
📧 robert.movlan@outlook.com  
🔗 [LinkedIn](https://www.linkedin.com/in/movlan-aliyev/)