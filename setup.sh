#!/bin/bash
# Invoice Generator SaaS - Quick Start Script

echo "========================================="
echo "Invoice Generator SaaS"
echo "Local Development Environment"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking prerequisites...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed${NC}"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"

echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
echo ""

# Install all dependencies
npm run install:all

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo -e "${GREEN}✅ Setup Complete!${NC}"
    echo "========================================="
    echo ""
    echo "To start development:"
    echo -e "${YELLOW}npm run dev${NC}"
    echo ""
    echo "This will start:"
    echo "  • Backend API on http://localhost:3001"
    echo "  • Frontend on http://localhost:3000"
    echo ""
    echo "Open http://localhost:3000 in your browser"
    echo ""
    echo "Documentation:"
    echo "  • QUICK_START.md - Quick reference"
    echo "  • LOCAL_DEVELOPMENT.md - Detailed guide"
    echo "  • ARCHITECTURE.md - System architecture"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠️  Installation failed${NC}"
    exit 1
fi
