#!/bin/bash

echo "🚀 Starting DealHub Database Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    exit 1
fi

echo "🐳 Starting PostgreSQL database with Docker..."

# Start the database
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Docker containers"
    exit 1
fi

echo "⏳ Waiting for database to be ready..."
sleep 15

echo "🔍 Checking database connection..."
npm run db:check

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed"
    echo "🔧 Try manually: docker-compose logs postgres"
    exit 1
fi

echo "📋 Pushing database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    echo "🔧 Try manually: npm run db:push"
    exit 1
fi

echo "🌱 Seeding database with categories..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    echo "🔧 Try manually: npm run db:seed"
    exit 1
fi

echo "✅ Database setup complete!"
echo ""
echo "🎉 You can now run: npm run dev"
echo "🌐 Then visit: http://localhost:3000"
echo ""
echo "📝 Database credentials:"
echo "   Host: localhost:5432"
echo "   Database: dealhub"
echo "   Username: dealhub_user"
echo "   Password: dealhub_password"
echo ""
echo "🛠️  Useful commands:"
echo "   npm run db:check    - Test database connection"
echo "   npm run db:studio   - Open database GUI"
echo "   npm run db:reset    - Reset and reseed database"