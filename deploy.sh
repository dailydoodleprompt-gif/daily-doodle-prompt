#!/bin/bash

# ============================================================================
# Daily Doodle Prompt - GitHub & Vercel Deployment Script
# ============================================================================
# This script automates the deployment process:
# 1. Validates environment setup
# 2. Runs production build locally
# 3. Creates/updates GitHub repository
# 4. Triggers Vercel deployment
#
# Usage:
#   ./deploy.sh [options]
#
# Options:
#   --skip-build    Skip local build validation
#   --skip-git      Skip Git operations
#   --skip-vercel   Skip Vercel deployment
#   --dry-run       Show what would be done without executing
#   --help          Show this help message
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script options
SKIP_BUILD=false
SKIP_GIT=false
SKIP_VERCEL=false
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-git)
      SKIP_GIT=true
      shift
      ;;
    --skip-vercel)
      SKIP_VERCEL=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help)
      head -n 20 "$0" | grep "^#" | sed 's/^# //'
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Helper functions
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

execute_command() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN]${NC} $1"
  else
    eval "$1"
  fi
}

# ============================================================================
# Step 1: Validate Environment
# ============================================================================
print_header "Step 1: Validating Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed"
  exit 1
fi
print_success "Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed"
  exit 1
fi
print_success "npm $(npm --version) detected"

# Check if Git is installed
if ! command -v git &> /dev/null; then
  print_error "Git is not installed"
  exit 1
fi
print_success "Git $(git --version | cut -d ' ' -f 3) detected"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  print_error "package.json not found. Are you in the project root?"
  exit 1
fi
print_success "package.json found"

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
  print_warning ".env.example not found"
else
  print_success ".env.example found"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  print_warning "node_modules not found. Installing dependencies..."
  execute_command "npm install"
fi
print_success "Dependencies installed"

# ============================================================================
# Step 2: Run Production Build (Optional)
# ============================================================================
if [ "$SKIP_BUILD" = false ]; then
  print_header "Step 2: Running Production Build Validation"

  print_info "This may take 1-2 minutes..."

  if [ "$DRY_RUN" = false ]; then
    # Run build
    if npm run build:nocheck; then
      print_success "Production build successful"

      # Check if dist directory was created
      if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        print_success "Build output: dist/ ($DIST_SIZE)"
      else
        print_error "dist/ directory not created"
        exit 1
      fi
    else
      print_error "Production build failed"
      print_info "Fix errors and try again, or use --skip-build to skip this step"
      exit 1
    fi
  else
    print_info "[DRY RUN] Would run: npm run build:nocheck"
  fi
else
  print_warning "Skipping build validation (--skip-build)"
fi

# ============================================================================
# Step 3: Git Repository Setup
# ============================================================================
if [ "$SKIP_GIT" = false ]; then
  print_header "Step 3: Git Repository Setup"

  # Check if Git repository is initialized
  if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    execute_command "git init"
    print_success "Git repository initialized"
  else
    print_success "Git repository already initialized"
  fi

  # Check if .gitignore exists
  if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore not found"
  else
    print_success ".gitignore found"
  fi

  # Check for uncommitted changes
  if [ "$DRY_RUN" = false ] && [ -n "$(git status --porcelain)" ]; then
    print_info "Uncommitted changes detected"

    # Show status
    git status --short

    echo ""
    read -p "Commit all changes? (y/n) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      read -p "Enter commit message: " COMMIT_MESSAGE

      execute_command "git add ."
      execute_command "git commit -m \"${COMMIT_MESSAGE}\""
      print_success "Changes committed"
    else
      print_warning "Skipping commit"
    fi
  else
    print_info "Working tree is clean"
  fi

  # Check if remote 'origin' exists
  if [ "$DRY_RUN" = false ] && ! git remote | grep -q "^origin$"; then
    print_warning "No remote 'origin' configured"

    read -p "Enter GitHub repository URL (e.g., https://github.com/user/repo.git): " REPO_URL

    if [ -n "$REPO_URL" ]; then
      execute_command "git remote add origin $REPO_URL"
      print_success "Remote 'origin' added"
    else
      print_warning "No remote added. You'll need to add it manually later."
    fi
  else
    if [ "$DRY_RUN" = false ]; then
      REMOTE_URL=$(git remote get-url origin)
      print_success "Remote 'origin': $REMOTE_URL"
    fi
  fi

  # Ask to push to GitHub
  if [ "$DRY_RUN" = false ]; then
    echo ""
    read -p "Push to GitHub? (y/n) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Determine current branch
      CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
      print_info "Pushing to branch: $CURRENT_BRANCH"

      execute_command "git push -u origin $CURRENT_BRANCH"
      print_success "Pushed to GitHub"
    else
      print_warning "Skipping GitHub push"
    fi
  else
    print_info "[DRY RUN] Would push to GitHub"
  fi
else
  print_warning "Skipping Git operations (--skip-git)"
fi

# ============================================================================
# Step 4: Vercel Deployment
# ============================================================================
if [ "$SKIP_VERCEL" = false ]; then
  print_header "Step 4: Vercel Deployment"

  # Check if Vercel CLI is installed
  if command -v vercel &> /dev/null; then
    print_success "Vercel CLI detected"

    if [ "$DRY_RUN" = false ]; then
      echo ""
      read -p "Deploy to Vercel? (y/n) " -n 1 -r
      echo

      if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Deploy to production? (y/n, default: preview) " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
          print_info "Deploying to production..."
          execute_command "vercel --prod"
        else
          print_info "Deploying preview..."
          execute_command "vercel"
        fi

        print_success "Deployment triggered"
      else
        print_warning "Skipping Vercel deployment"
      fi
    else
      print_info "[DRY RUN] Would deploy to Vercel"
    fi
  else
    print_warning "Vercel CLI not installed"
    print_info "Install with: npm install -g vercel"
    print_info "Or deploy manually via Vercel Dashboard: https://vercel.com/new"
  fi
else
  print_warning "Skipping Vercel deployment (--skip-vercel)"
fi

# ============================================================================
# Step 5: Summary
# ============================================================================
print_header "Deployment Summary"

echo -e "${GREEN}✓ Deployment process complete!${NC}\n"

print_info "Next steps:"
echo "  1. Verify build succeeded on Vercel Dashboard"
echo "  2. Update OAuth redirect URIs with your Vercel domain"
echo "  3. Test authentication (Google, Apple, email/password)"
echo "  4. Test core features (prompts, uploads, badges)"
echo "  5. Monitor analytics and error tracking"

echo ""
print_info "Resources:"
echo "  • Vercel Dashboard: https://vercel.com/dashboard"
echo "  • Deployment Guide: DEPLOYMENT.md"
echo "  • Vercel Setup: VERCEL_SETUP.md"
echo "  • Environment Variables: ENV_VARS.md"

echo -e "\n${GREEN}Happy deploying! 🚀${NC}\n"
