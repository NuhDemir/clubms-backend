#!/bin/bash

# Build Verification Script
# Render deploy öncesi build'i doğrular

set -e

echo "🔍 Verifying build for production deployment..."

# 1. Check Node version
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "   Node.js: $node_version"

if [[ ! "$node_version" =~ ^v20 ]]; then
    echo "❌ Node.js 20.x required, found $node_version"
    exit 1
fi

# 2. Install dependencies
echo "📥 Installing dependencies..."
npm ci

# 3. Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 4. Validate Prisma Schema
echo "✅ Validating Prisma schema..."
npx prisma validate

# 5. Build TypeScript
echo "🏗️  Building TypeScript..."
npm run build

# 6. Check build output
echo "📂 Checking build output..."
if [ ! -d "dist" ]; then
    echo "❌ dist/ directory not found"
    exit 1
fi

if [ ! -f "dist/main.js" ]; then
    echo "❌ dist/main.js not found"
    exit 1
fi

echo "   ✓ dist/main.js exists"

# 7. Check required files
echo "📋 Checking required files..."
required_files=(
    "package.json"
    "package-lock.json"
    "prisma/schema.prisma"
    "render.yaml"
    ".env.production.example"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
    echo "   ✓ $file exists"
done

# 8. Check environment variables template
echo "🔐 Checking environment variables..."
if ! grep -q "FIREBASE_PROJECT_ID" .env.production.example; then
    echo "❌ .env.production.example missing FIREBASE_PROJECT_ID"
    exit 1
fi

if ! grep -q "DATABASE_URL" .env.production.example; then
    echo "❌ .env.production.example missing DATABASE_URL"
    exit 1
fi

echo "   ✓ Environment template valid"

# 9. Check package.json scripts
echo "📜 Checking package.json scripts..."
if ! grep -q "start:prod" package.json; then
    echo "❌ package.json missing start:prod script"
    exit 1
fi

echo "   ✓ Required scripts present"

# 10. Estimate build size
echo "📊 Estimating build size..."
dist_size=$(du -sh dist/ | cut -f1)
echo "   Build size: $dist_size"

# Success
echo ""
echo "✅ Build verification completed successfully!"
echo ""
echo "🚀 Ready for deployment to Render"
echo ""
echo "Next steps:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Monitor deployment: https://dashboard.render.com"
echo "  3. Check health: curl https://your-service.onrender.com/health"
