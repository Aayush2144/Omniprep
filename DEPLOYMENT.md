# 🚀 OmniPrep Suite — Deployment & Production Guide

This document provides step-by-step instructions to deploy the **OmniPrep Mastery Suite** online for free.

---

## 🌟 Option 1: Deploy on Render.com (Recommended — 100% Free & Easy)

Render provides free hosting for full-stack Node.js + Express apps with persistent storage.

### Steps:
1. **Push your code to GitHub / GitLab**:
   ```bash
   git init
   git add .
   git commit -m "Deploy OmniPrep Suite"
   git remote add origin https://github.com/YOUR_USERNAME/omniprep-tracker.git
   git branch -M main
   git push -u origin main
   ```

2. **Go to Render**:
   - Visit [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
   - Click **"New +"** $\rightarrow$ **"Web Service"**.
   - Select your `omniprep-tracker` repository.

3. **Configure the Web Service**:
   - **Name**: `omniprep-tracker` (or your chosen name)
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: `Free`

4. **Environment Variables (Optional)**:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional — users can also enter their key in the UI)*

5. Click **"Deploy Web Service"**!
   - Render will build the Vite React frontend, start the unified Express server, and give you a live URL (e.g., `https://omniprep-tracker.onrender.com`).

---

## 🚂 Option 2: Deploy on Railway.app

Railway offers fast, one-click deployments with built-in Docker support.

### Steps:
1. Visit [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **"New Project"** $\rightarrow$ **"Deploy from GitHub repo"**.
3. Select your repository.
4. Railway will automatically detect the `Dockerfile` or `package.json` and build the app.
5. In **Settings** $\rightarrow$ **Networking**, click **"Generate Domain"** to get your public live URL.

---

## 🐳 Option 3: Deploy with Docker (VPS / AWS / DigitalOcean / Linode)

The project includes a multi-stage `Dockerfile` optimized for minimal size and high performance.

### 1. Build the Docker image:
```bash
docker build -t omniprep-app .
```

### 2. Run the container:
```bash
docker run -d -p 5000:5000 --name omniprep -v $(pwd)/server:/app/server omniprep-app
```

### 3. Access the application:
Open your browser at `http://YOUR_SERVER_IP:5000/`.

---

## ⚡ Option 4: Deploy on Vercel (Frontend Focus)

1. Push your project to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Framework Preset: **Vite**.
4. Output Directory: `dist`.
5. Build Command: `npm run build`.
6. Click **Deploy**.

---

## 🔒 Gemini API Key Security in Production
- Your Gemini API key is never hardcoded.
- You can provide your Gemini API key in the web app UI by clicking **`Set Gemini Key 🔑`** in the top header.
- Alternatively, you can set the `GEMINI_API_KEY` environment variable in your cloud dashboard.

---

## 📦 Production Architecture Summary
- **Frontend**: React 18 + Tailwind CSS + Lucide Icons + Recharts, pre-compiled into static bundle in `dist/`.
- **Backend & Database**: Express.js + SQLite (`better-sqlite3`), running unified on a single port for zero-configuration deployments.
- **AI Engine**: Direct Google Generative AI REST API with live dynamic model discovery (`gemini-2.0-flash`, `gemini-1.5-flash`).
