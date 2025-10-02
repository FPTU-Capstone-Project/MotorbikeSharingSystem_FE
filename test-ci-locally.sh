#!/bin/bash

# 🧪 Test CI workflow locally trước khi push lên GitHub
# Chạy tất cả các bước như GitHub Actions

set -e

echo "🧪 Testing CI Pipeline Locally"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install
echo -e "${YELLOW}📦 Step 1: Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Test
echo -e "${YELLOW}🔍 Step 2: Running tests...${NC}"
CI=true npm test -- --passWithNoTests --watchAll=false
echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Step 3: Build
echo -e "${YELLOW}🏗️  Step 3: Building application...${NC}"
CI=false GENERATE_SOURCEMAP=false npm run build
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 4: Build Size Report
echo -e "${YELLOW}📊 Step 4: Build size analysis...${NC}"
echo "📦 Build output size:"
du -sh build/
echo ""
echo "📄 Main bundle sizes:"
ls -lh build/static/js/*.js | awk '{print $5, $9}'
echo ""

# Step 5: Check bundle size warnings
MAIN_BUNDLE_SIZE=$(ls -l build/static/js/main.*.js | awk '{print $5}')
if [ "$MAIN_BUNDLE_SIZE" -gt 512000 ]; then
    echo -e "${YELLOW}⚠️  Warning: Main bundle > 500KB (current: $(du -h build/static/js/main.*.js | cut -f1))${NC}"
else
    echo -e "${GREEN}✅ Bundle size OK${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}🎉 All checks passed!${NC}"
echo "================================"
echo "Your code is ready to push:"
echo ""
echo "  git add ."
echo "  git commit -m \"your message\""
echo "  git push origin master"
echo ""
echo "GitHub Actions sẽ tự động chạy pipeline này khi push."
echo ""
