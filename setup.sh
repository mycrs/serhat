#!/bin/bash

# Serhat M3U Admin Panel Setup Script

echo "🚀 Setting up Serhat M3U Admin Panel..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if MongoDB is installed (optional)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. The app will work but without data persistence."
    echo "   Install MongoDB for full functionality: https://docs.mongodb.com/manual/installation/"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "⚙️  Creating backend environment file..."
    cp backend/.env.example backend/.env 2>/dev/null || cat > backend/.env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/serhat_m3u
NODE_ENV=development
EOL
fi

if [ ! -f frontend/.env.local ]; then
    echo "⚙️  Creating frontend environment file..."
    cat > frontend/.env.local << EOL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
EOL
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start MongoDB (if installed): mongod"
echo "2. Start the development servers: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔗 Useful URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   API Health: http://localhost:5000/health"
echo ""
echo "📚 For more information, see README.md"