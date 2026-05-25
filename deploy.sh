#!/bin/bash
set -e

echo "=== Building Background Remover ==="

# Install dependencies
echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing client dependencies..."
cd client && npm install && cd ..

# Build client
echo "Building client..."
cd client && npm run build && cd ..

# Run tests
echo "Running backend tests..."
cd server && node --experimental-test-coverage --test __tests__/*.test.js && cd ..

echo "Running frontend tests..."
cd client && npx vitest run && cd ..

echo "=== Build & Test Complete ==="
echo ""
echo "To deploy:"
echo "  Frontend: vercel --prod"
echo "  Backend:  docker build -t bg-remover-server . && docker run -p 5000:5000 bg-remover-server"
