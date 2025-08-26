# 🚀 **DEPLOYMENT INSTRUCTIONS - SYMBOL DUEL**

## 🎯 **YOUR SUPABASE CREDENTIALS:**
- **URL**: https://vegzvwfceqcqnqujkaji.supabase.co
- **API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc

---

## 📋 **STEP 1: SET UP SUPABASE DATABASE**

### 1.1 Go to Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Open your project: https://vegzvwfceqcqnqujkaji.supabase.co
3. Click on **SQL Editor** in the left sidebar

### 1.2 Run Database Setup
1. Copy **ALL** contents of `WORKING_DATABASE_SETUP.sql`
2. Paste into SQL Editor
3. Click **Run** button
4. You should see "Tables created successfully"

### 1.3 Test Database
1. Copy **ALL** contents of `TEST_DATABASE.sql`
2. Paste into SQL Editor
3. Click **Run** button
4. You should see all ✅ statuses

---

## 🚀 **STEP 2: DEPLOY TO VERCEL**

### 2.1 Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment with real Supabase"
git push origin main
```

### 2.2 Deploy to Vercel
1. Go to: https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repository: **RileyCraig14/symbol-duel**
4. Click **"Deploy"**

### 2.3 Add Environment Variables
In Vercel dashboard, go to your project → **Settings** → **Environment Variables**:

Add these variables:
```
REACT_APP_SUPABASE_URL = https://vegzvwfceqcqnqujkaji.supabase.co
REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc
```

### 2.4 Redeploy
After adding environment variables, click **"Redeploy"**

---

## 🎮 **STEP 3: TEST YOUR LIVE WEBSITE**

### 3.1 Your Live URL
Your app will be live at: **https://symbol-duel.vercel.app**

### 3.2 Test the App
1. **Open the URL** in your browser
2. **Create an account** (you'll get $100 fake money)
3. **Create a game** with an entry fee
4. **Test the multiplayer** functionality

### 3.3 Test with Friends
1. **Share the URL** with friends
2. **Everyone creates accounts** (gets $100 fake money)
3. **Create games** and join each other's games
4. **Play real-time multiplayer** puzzles
5. **Winner takes prize pool**

---

## 🎯 **WHAT USERS WILL EXPERIENCE:**

### **Sign Up Process:**
1. **Create account** with email/password
2. **Get $100 fake money** automatically
3. **See live leaderboard** with other players

### **Game Creation:**
1. **Create game** with custom entry fee (e.g., $25)
2. **Set max players** (3-6 players)
3. **Game appears** on other players' screens
4. **Real-time player count** updates

### **Game Play:**
1. **Players join** your game
2. **Game starts** when 3+ players join
3. **6 rounds** of puzzle solving
4. **Real-time scoring** and leaderboard
5. **Winner takes all** prize pool

---

## 🎉 **YOU'RE LIVE!**

### **Share This URL:**
**https://symbol-duel.vercel.app**

### **What Friends Can Do:**
- ✅ **Sign up** and get $100 fake money
- ✅ **Create games** with entry fees
- ✅ **Join each other's games**
- ✅ **Play real-time multiplayer** puzzles
- ✅ **Win prize pools**
- ✅ **See live leaderboards**

---

## 📞 **NEED HELP?**

### **If Database Setup Fails:**
1. Check Supabase project is active
2. Verify you're in the right project
3. Make sure SQL Editor is working
4. Try running the SQL in smaller chunks

### **If Deployment Fails:**
1. Check environment variables are set correctly
2. Verify GitHub repository is connected
3. Check Vercel build logs for errors
4. Make sure all files are committed to GitHub

### **If App Doesn't Work:**
1. Check browser console (F12) for errors
2. Verify Supabase connection
3. Check if database tables exist
4. Test with multiple browsers/devices

---

## 🚀 **FINAL CHECKLIST:**

- [ ] ✅ Supabase database set up
- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Deployed to Vercel
- [ ] ✅ Environment variables added
- [ ] ✅ App is live and working
- [ ] ✅ Tested with multiple users
- [ ] ✅ Shared with friends

**Your multiplayer betting website is now live and ready for real users!** 🎮
