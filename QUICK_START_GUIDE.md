# Symbol Duel - Quick Start Guide

## 🚀 Get Your App Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
The app needs a Supabase database. You have two options:

**Option A: Automatic Setup (Recommended)**
```bash
node setup_supabase_simple.js
```

**Option B: Manual Setup**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project: `vegzvwfceqcqnqujkaji`
3. Click "SQL Editor" in the left sidebar
4. Copy and paste the contents of `supabase/setup_database.sql`
5. Click "Run" to execute

### 3. Start Development Server
```bash
npm start
```

Your app will open at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

### 5. Deploy to Vercel
```bash
npm run deploy
```

## 🔧 What's Fixed

✅ **Compilation Errors** - All React component errors resolved
✅ **Database Schema** - Complete table structure with proper relationships
✅ **Legal Compliance** - Skill-based gaming compliance system implemented
✅ **Authentication** - Google/GitHub OAuth working
✅ **Game System** - Individual games with real-money prizes
✅ **Security** - Row Level Security (RLS) policies configured

## 🎯 Key Features

- **Skill-Based Gaming**: No random elements, pure puzzle-solving
- **Real-Money Prizes**: Legal in most US states (6% platform fee)
- **Compliance System**: Automatic location and age verification
- **Individual Games**: Create and join puzzle competitions
- **User Profiles**: Track balance, winnings, and game history

## 🚫 Legal Restrictions

The app automatically detects your location and restricts real-money features in:
- Washington, Idaho, Montana, Louisiana, Arkansas
- Missouri, Iowa, Illinois, Indiana, Ohio
- Pennsylvania, New York, New Jersey, Delaware
- Maryland, Virginia, North Carolina, South Carolina
- Georgia, Tennessee, Kentucky, West Virginia, Alabama, Mississippi

## 💰 Fee Structure

- **Platform Fee**: 6% (industry standard for skill-based gaming)
- **Prize Pool**: 94% of entry fees
- **Entry Fees**: $1 - $100 (round numbers only)

## 🆘 Troubleshooting

**Database Connection Issues**
- Check your Supabase project is active
- Verify the URL and key in `src/utils/supabase.js`

**Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check for any missing environment variables

**Authentication Issues**
- Ensure Google/GitHub OAuth is configured in Supabase
- Check browser console for error messages

## 📱 Deployment

The app is ready for production deployment on:
- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- Any static hosting service

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- User authentication required for real-money features
- Compliance logging for audit trails
- Secure API endpoints with proper authorization

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase database is properly configured
3. Ensure all required tables exist in your database

---

**Your Symbol Duel app is now ready for deployment! 🎉**
