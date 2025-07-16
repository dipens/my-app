# 🎯 DealHub - Modern Deal Discussion Forum

A comprehensive web forum for discovering and sharing the best deals, built with Next.js, TypeScript, and PostgreSQL.

## ✨ Features

- 🔐 **Authentication**: Username/password + social logins (Google, GitHub, Facebook, Microsoft)
- 📱 **Modern UI**: Responsive design with Tailwind CSS
- 🏷️ **Categories**: Organized deal categories and subcategories
- 💬 **Comments**: Threaded comment system with nested replies
- ⬆️ **Voting**: Upvote/downvote posts and comments
- 🔍 **Search**: Find deals across categories
- 💰 **Deal Info**: Price tracking, store names, online/in-store designation
- 🚀 **Performance**: Server-side rendering with hydration optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker (recommended) or PostgreSQL

### 1. Clone and Install
```bash
git clone <your-repo>
cd my-app
npm install
```

### 2. Database Setup (Choose One)

#### Option A: Docker (Recommended)
```bash
# Start PostgreSQL with Docker
npm run db:setup
```

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or follow setup-database.md for other systems

# Create database
createdb dealhub

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your database credentials
```

### 3. Initialize Database
```bash
# Push schema to database
npm run db:push

# Seed with categories
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🗄️ Database

### Schema Overview
- **users**: Authentication and user profiles
- **categories**: Main deal categories (Electronics, Fashion, etc.)
- **subcategories**: Specific subcategories under each category
- **posts**: Deal posts with pricing and store information  
- **comments**: Threaded comments with replies
- **votes**: Upvote/downvote tracking

### Database Commands
```bash
npm run db:push      # Push schema changes
npm run db:seed      # Seed categories
npm run db:studio    # Open Drizzle Studio
npm run db:reset     # Reset and reseed database
```

## 🔧 Configuration

### Environment Variables
Create `.env.local`:
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dealhub

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=http://localhost:3000

# Social Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# ... other providers
```

### Social Login Setup
1. Create OAuth apps with providers
2. Add client IDs and secrets to `.env.local`
3. Configure redirect URLs to `http://localhost:3000/api/auth/callback/[provider]`

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post CRUD operations
│   │   ├── comments/      # Comment operations
│   │   └── votes/         # Voting system
│   ├── auth/              # Auth pages (signin/signup)
│   ├── posts/             # Post pages (create/view)
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   ├── PostCard.tsx       # Post display component
│   ├── VoteButtons.tsx    # Voting interface
│   └── CommentSection.tsx # Comment system
├── db/                    # Database layer
│   ├── schema.ts          # Drizzle schema
│   ├── index.ts           # DB connection
│   └── seed.ts            # Database seeding
└── lib/                   # Utilities
    └── auth.ts            # NextAuth configuration
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## 🎨 Categories

Pre-seeded categories include:
- 📱 Electronics (Smartphones, Laptops, Gaming, etc.)
- 👕 Clothing & Fashion (Men's, Women's, Shoes, etc.)
- 🏠 Home & Garden (Furniture, Kitchen, Decor, etc.)
- 🚗 Automotive (Parts, Accessories, Care, etc.)
- 💄 Health & Beauty (Skincare, Makeup, Supplements, etc.)
- ⚽ Sports & Outdoors (Fitness, Outdoor Gear, Team Sports, etc.)
- 🍕 Food & Beverages (Restaurants, Grocery, Delivery, etc.)
- ✈️ Travel & Entertainment (Hotels, Flights, Events, etc.)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Database Options for Production
- **Neon**: Free PostgreSQL with excellent Next.js integration
- **Supabase**: Full backend-as-a-service with PostgreSQL
- **Railway**: Simple PostgreSQL hosting
- **PlanetScale**: MySQL alternative with branching

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push database schema
npm run db:seed      # Seed database
npm run db:studio    # Open database GUI
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Tailwind for consistent styling
- Server components where possible
- Client components for interactivity

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify credentials and permissions

### Hydration Errors
- Browser extensions may cause warnings
- Added suppressHydrationWarning where needed
- Use client-side rendering guards

### Authentication Issues
- Check NEXTAUTH_SECRET is set
- Verify social provider credentials
- Ensure callback URLs are correct

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details