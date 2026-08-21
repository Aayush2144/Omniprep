# 🚀 OmniPrep Suite — Deployment & Production Guide

This document provides step-by-step instructions to deploy the **OmniPrep Mastery Suite** online for free.

---

## 🐘 100% Persistent Data: Connect Free Cloud PostgreSQL on Render

On Render's free tier, containers restart when redeploying. To ensure **your database NEVER loses data across unlimited redeployments**, attach Render's free PostgreSQL database:

### 2-Minute Setup:
1. On **[dashboard.render.com](https://dashboard.render.com/)**, click **"New +"** (top right) $\rightarrow$ select **"PostgreSQL"**.
2. Set:
   - **Name**: `omniprep-db`
   - **Database**: `omniprep`
   - **Region**: Same region as your Web Service (e.g. *Singapore* or *Frankfurt*)
   - **Plan**: `Free`
3. Click **"Create Database"**.
4. Once created, copy the **"Internal Database URL"** (e.g. `postgresql://omniprep:...@dpg-...:5432/omniprep`).
5. Go to your **OmniPrep Web Service** $\rightarrow$ **Environment** tab $\rightarrow$ click **"Add Environment Variable"**:
   - **Key**: `DATABASE_URL`
   - **Value**: *(Paste the Internal Database URL you copied)*
6. Click **"Save Changes"**.

> **Result**: OmniPrep will automatically detect `DATABASE_URL`, connect to cloud PostgreSQL, and store all user records, study sessions, flashcards, notes, and leaderboards permanently in the cloud!

---

## 🌟 Deploying on Render.com (100% Free & Easy)

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy OmniPrep Suite"
   git push origin main
   ```

2. **Go to Render**:
   - Visit [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
   - Click **"New +"** $\rightarrow$ **"Web Service"**.
   - Select your `Omniprep` repository.

3. **Configure the Web Service**:
   - **Name**: `omniprep`
   - **Region**: Choose closest (e.g. *Singapore* or *Frankfurt*)
   - **Branch**: `main`
   - **Language**: `Docker` *(or Node with `npm install && npm run build` & `npm start`)*
   - **Plan**: `Free`

4. Click **"Deploy Web Service"**!
   - Render gives you a live public HTTPS URL (e.g., `https://omniprep-wg7a.onrender.com`).

---

## 🔒 Gemini API Key Security in Production
- Your Gemini API key is never hardcoded.
- You can provide your Gemini API key in the web app UI by clicking **`Set Gemini Key 🔑`** in the top header.
- Alternatively, you can set the `GEMINI_API_KEY` environment variable in your Render dashboard.
