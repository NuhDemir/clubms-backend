#!/bin/bash

# Quick Deploy Script
# Hızlı deployment için tüm adımları otomatikleştirir

set -e

echo "🚀 ClubMS Backend - Quick Deploy to Render"
echo "=========================================="
echo ""

# 1. Git status kontrolü
echo "📋 Checking git status..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
    else
        echo "❌ Please commit or stash your changes first"
        exit 1
    fi
fi

# 2. Branch kontrolü
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

if [[ "$current_branch" != "main" && "$current_branch" != "production" ]]; then
    echo "⚠️  You're not on main or production branch"
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. Build verification
echo ""
echo "🔍 Running build verification..."
bash scripts/verify-build.sh

# 4. Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin $current_branch

# 5. Deployment bilgisi
echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "🎯 Deployment Status:"
echo "  - Render will automatically deploy from this push"
echo "  - Monitor at: https://dashboard.render.com"
echo "  - GitHub Actions: https://github.com/your-repo/actions"
echo ""
echo "⏳ Estimated deployment time: 3-5 minutes"
echo ""
echo "🔗 Quick Links:"
echo "  - API: https://clubms-backend.onrender.com"
echo "  - Docs: https://clubms-backend.onrender.com/api-docs"
echo "  - Health: https://clubms-backend.onrender.com/health"
echo ""
echo "💡 Tip: Run 'npm run logs' to tail Render logs"
