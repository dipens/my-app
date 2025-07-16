# Database Setup Guide

## Option 1: Local PostgreSQL (Recommended for Development)

### Install PostgreSQL:

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

### Create Database:

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE dealhub;
CREATE USER dealhub_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE dealhub TO dealhub_user;
\q
```

### Create .env.local file:

```bash
# Copy example and edit
cp .env.example .env.local
```

Edit `.env.local`:

```
DATABASE_URL=postgresql://dealhub_user:your_secure_password@localhost:5432/dealhub

# NextAuth.js
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000

# Social Login Providers (optional for now)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# ... other providers
```

## Option 2: Docker PostgreSQL (Easy Setup)

### Create docker-compose.yml:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dealhub
      POSTGRES_USER: dealhub_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Start Database:

```bash
docker-compose up -d
```

### .env.local:

```
DATABASE_URL=postgresql://dealhub_user:your_secure_password@localhost:5432/dealhub
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
```

## Option 3: Cloud Database (Production-like)

### Popular Options:

- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app
- **PlanetScale** (MySQL alternative): https://planetscale.com

### After Setup:

1. Copy the connection string they provide
2. Add to `.env.local`:

```
DATABASE_URL=your_cloud_database_connection_string
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars
NEXTAUTH_URL=http://localhost:3000
```

---

## After Database Setup:

### 1. Push Database Schema:

```bash
npm run db:push
```

### 2. Seed Categories:

```bash
npm run db:seed
```

### 3. Start Development Server:

```bash
npm run dev
```

### 4. Verify Setup:

- Visit http://localhost:3000
- You should see the forum homepage
- Categories should load in the sidebar

## Troubleshooting:

### Connection Refused Error:

- Ensure PostgreSQL is running
- Check the DATABASE_URL format
- Verify credentials

### Permission Errors:

- Ensure the user has proper database privileges
- Check firewall settings

### Migration Errors:

- Drop and recreate the database if needed
- Ensure Drizzle config is correct
