#!/bin/bash

# 🚀 Script tự động lấy Vercel credentials cho GitHub Actions
# Usage: cd frontend && ./get-vercel-secrets.sh

set -e

echo "🔧 Vercel GitHub Actions Setup Script"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
    echo "✅ Vercel CLI installed"
fi

echo ""
echo "🔗 Step 1: Link project to Vercel"
echo "--------------------------------"
echo "Sẽ mở browser để đăng nhập Vercel..."
sleep 2

vercel link

echo ""
echo "✅ Project linked successfully!"
echo ""

# Read credentials from .vercel/project.json
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    
    echo "📋 Step 2: Your Vercel Credentials"
    echo "--------------------------------"
    echo ""
    echo "VERCEL_PROJECT_ID: $PROJECT_ID"
    echo "VERCEL_ORG_ID: $ORG_ID"
    echo ""
else
    echo "❌ Error: .vercel/project.json not found"
    exit 1
fi

echo "🔑 Step 3: Get Vercel Token"
echo "--------------------------------"
echo "1. Mở: https://vercel.com/account/tokens"
echo "2. Click 'Create Token'"
echo "3. Đặt tên: 'GitHub Actions'"
echo "4. Scope: Full Account"
echo "5. Copy token"
echo ""

echo "⚙️  Step 4: Add Secrets to GitHub"
echo "--------------------------------"
echo "1. Mở: https://github.com/FPTU-Capstone-Project/MotorbikeSharingSystem_FE/settings/secrets/actions"
echo "2. Click 'New repository secret' và thêm:"
echo ""
echo "   Name: VERCEL_TOKEN"
echo "   Value: <paste token từ bước 3>"
echo ""
echo "   Name: VERCEL_PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "   Name: VERCEL_ORG_ID"
echo "   Value: $ORG_ID"
echo ""

echo "✅ Setup Complete!"
echo "--------------------------------"
echo "Sau khi thêm secrets, push code để trigger deployment:"
echo ""
echo "  git add ."
echo "  git commit -m \"chore: add GitHub Actions CI/CD\""
echo "  git push origin master"
echo ""
echo "🔍 Xem deployment progress tại:"
echo "  https://github.com/FPTU-Capstone-Project/MotorbikeSharingSystem_FE/actions"
echo ""
