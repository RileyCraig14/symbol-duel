# Symbol Duel 🎮

A skill-based puzzle competition platform with real-money prizes, built with React and Supabase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
node setup_supabase_simple.js
```

### 3. Start Development
```bash
npm start
```

### 4. Deploy to Production
```bash
npm run build
npm run deploy
```

## ✨ Features

- **Skill-Based Gaming**: Pure puzzle-solving, no random elements
- **Real-Money Prizes**: Legal in most US states (6% platform fee)
- **Legal Compliance**: Automatic location and age verification
- **Individual Games**: Create and join puzzle competitions
- **User Authentication**: Google and GitHub OAuth
- **Secure Database**: Row Level Security with Supabase

## 🏗️ Architecture

- **Frontend**: React 19 with Framer Motion animations
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS with custom theme
- **Deployment**: Vercel-ready configuration

## 📊 Database Schema

The app includes comprehensive database tables:
- User profiles with compliance tracking
- Individual games and player management
- Game results and scoring
- Daily challenges and custom puzzles
- Tournament system
- Compliance logging and audit trails

## 🔒 Legal Compliance

Symbol Duel operates as a skill-based competition platform:
- **Legal in 45 US states** for real-money prizes
- **Restricted in 5 states** (virtual play only)
- **18+ age requirement** with verification
- **6% platform fee** (industry standard)
- **No gambling elements** - pure skill required

## 🎯 Game Types

- **Quick Play**: $5 entry, fast-paced challenges
- **Standard**: $10 entry, balanced difficulty
- **Premium**: $25 entry, advanced puzzles
- **Championship**: $50 entry, elite competitions

## 🚫 Restricted States

Real-money features are not available in:
- Washington, Idaho, Montana, Louisiana, Arkansas
- Missouri, Iowa, Illinois, Indiana, Ohio
- Pennsylvania, New York, New Jersey, Delaware
- Maryland, Virginia, North Carolina, South Carolina
- Georgia, Tennessee, Kentucky, West Virginia, Alabama, Mississippi

## 💰 Revenue Model

- **Platform Fee**: 6% of all entry fees
- **Prize Pool**: 94% distributed to winners
- **Entry Fees**: $1 - $100 (configurable)
- **Winner Takes All**: Highest score wins entire prize pool

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Setup
The app uses your existing Supabase configuration:
- URL: `https://vegzvwfceqcqnqujkaji.supabase.co`
- Keys are already configured in the code

### Available Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm run test` - Run tests
- `npm run deploy` - Deploy to Vercel

## 📱 Deployment

The app is production-ready and can be deployed to:
- **Vercel** (recommended - `npm run deploy`)
- **Netlify**
- **AWS Amplify**
- Any static hosting service

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Check for missing environment variables

**Database Issues**
- Run the setup script: `node setup_supabase_simple.js`
- Verify Supabase project is active
- Check SQL Editor for any error messages

**Authentication Problems**
- Ensure OAuth providers are configured in Supabase
- Check browser console for error messages

### Getting Help

1. Check the browser console for error messages
2. Verify your Supabase database configuration
3. Ensure all required tables exist
4. Review the `QUICK_START_GUIDE.md` for detailed setup

## 📚 Documentation

- **Quick Start**: `QUICK_START_GUIDE.md`
- **Legal Compliance**: `LEGAL_COMPLIANCE_README.md`
- **Database Setup**: `supabase/setup_database.sql`

## 🎉 Status

✅ **Ready for Production**
- All compilation errors resolved
- Database schema complete
- Legal compliance implemented
- Security policies configured
- Authentication working
- Game system functional

## 📄 License

This project is proprietary software. All rights reserved.

---

**Your Symbol Duel app is ready to launch! 🚀**
