# 🚀 Symbol Duel - Real Multiplayer Setup Guide

## 🎯 **What We've Built**

A real multiplayer betting website with:
- ✅ **Real Supabase database** with user profiles, games, and leaderboards
- ✅ **$100 fake money** on signup for testing
- ✅ **Real-time multiplayer** with live game updates
- ✅ **Actual leaderboards** with rankings and stats
- ✅ **Live game lobbies** where players can join and start games
- ✅ **Real authentication** with Supabase Auth

## 📋 **Setup Steps**

### **1. Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → "New project"
3. Choose your organization and create a new project
4. Wait for the project to be ready (2-3 minutes)

### **2. Set Up Database**

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `REAL_DATABASE_SETUP.sql`
3. Paste and run the SQL script
4. This creates all tables, triggers, and sample data

### **3. Get API Keys**

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env` file in your project root:

```bash
# Copy from env.example
REACT_APP_SUPABASE_URL=your-project-url-here
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### **4. Install Dependencies**

```bash
npm install
```

### **5. Start the App**

```bash
npm start
```

## 🎮 **How It Works**

### **User Flow:**
1. **Sign Up** → Gets $100 fake money automatically
2. **Create Game** → Sets entry fee, max players
3. **Join Games** → Other players can join your game
4. **Start Game** → When 3+ players, game begins
5. **Play Puzzles** → Real-time puzzle solving
6. **Win Money** → Winner gets entire prize pool
7. **Leaderboard** → Rankings update in real-time

### **Real-Time Features:**
- 🔄 **Live game updates** - See players joining/leaving
- 📊 **Live leaderboards** - Rankings update instantly
- 💰 **Real money tracking** - Account balances sync
- 🎯 **Game state sync** - All players see same game state

## 🧪 **Testing with Friends**

### **Option 1: Local Network**
1. Find your local IP: `ifconfig` (Mac) or `ipconfig` (Windows)
2. Start app: `npm start`
3. Share: `http://YOUR_IP:3000` with friends
4. Everyone can create accounts and play together

### **Option 2: Deploy to Production**
1. Push to GitHub
2. Connect to Vercel/Netlify
3. Add environment variables
4. Share the live URL

## 🎯 **What You Can Test**

### **Multiplayer Features:**
- ✅ Create games with different entry fees
- ✅ Join games from multiple devices/browsers
- ✅ See real-time player count updates
- ✅ Start games when enough players join
- ✅ Play puzzles simultaneously
- ✅ See live leaderboard updates
- ✅ Track real account balances

### **Game Mechanics:**
- ✅ $100 starting balance for all users
- ✅ Entry fees deducted when joining games
- ✅ Winner gets entire prize pool
- ✅ Games tracked in database
- ✅ Player stats updated automatically

## 🔧 **Database Tables Created**

- **profiles** - User accounts with $100 starting balance
- **games** - Game lobbies with entry fees and status
- **game_players** - Players in each game
- **game_rounds** - Individual puzzle rounds
- **player_answers** - Player responses and scores
- **leaderboard** - Real-time rankings view

## 🚀 **Next Steps**

Once you've tested the multiplayer functionality:

1. **Deploy to production** (Vercel/Netlify)
2. **Add real Stripe payments** (replace fake money)
3. **Custom domain** setup
4. **Marketing** to get more players

## 🆘 **Troubleshooting**

### **Common Issues:**

**"No puzzles available"**
- ✅ Fixed with fallback puzzle system

**"User not authenticated"**
- Check Supabase URL and keys in `.env`
- Make sure database tables are created

**"Failed to join game"**
- Check if user has enough balance
- Verify game isn't full

**Real-time not working**
- Check Supabase realtime is enabled
- Verify network connection

## 📞 **Need Help?**

1. Check browser console for error messages
2. Verify Supabase project is active
3. Make sure all environment variables are set
4. Test with multiple browser windows/devices

---

**🎉 You now have a fully functional multiplayer betting website!**

Your friends can sign up, get $100 fake money, create games, and play against each other in real-time. The leaderboards update live, and all game data is stored in a real database.
