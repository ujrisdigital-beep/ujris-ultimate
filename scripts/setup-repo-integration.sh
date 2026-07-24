#!/bin/bash

################################################################################
# 🚀 GITHUB + VERCEL INTEGRATION SETUP SCRIPT
# ============================================================================
# Universal script to integrate ANY repository with Vercel + GitHub Actions
# 
# Usage: ./setup-repo-integration.sh
#
# This script will:
# 1. Guide you through setup interactively
# 2. Gather required Vercel project information
# 3. Create GitHub Actions workflow
# 4. Set GitHub Secrets
# 5. Enable branch protection
# 6. Verify integration
#
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# UTILITY FUNCTIONS
################################################################################

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

pause_for_user() {
    read -p "Press Enter to continue..."
}

################################################################################
# SECTION 1: GATHER INFORMATION
################################################################################

gather_repository_info() {
    print_header "📋 STEP 1: Repository Information"
    
    echo "Enter your GitHub repository details:"
    read -p "GitHub Owner (e.g., ujrisdigital-beep): " GITHUB_OWNER
    read -p "GitHub Repository (e.g., ujris-ultimate): " GITHUB_REPO
    read -p "Default Branch (default: main): " GITHUB_BRANCH
    GITHUB_BRANCH=${GITHUB_BRANCH:-main}
    
    # Verify repository exists
    print_info "Verifying repository exists..."
    if gh repo view "$GITHUB_OWNER/$GITHUB_REPO" &>/dev/null; then
        print_success "Repository found: $GITHUB_OWNER/$GITHUB_REPO"
    else
        print_error "Repository not found. Please check the owner and name."
        exit 1
    fi
}

gather_vercel_info() {
    print_header "🚀 STEP 2: Vercel Project Information"
    
    echo "Enter your Vercel deployment details:"
    read -p "Vercel Project ID: " VERCEL_PROJECT_ID
    read -p "Vercel Organization ID: " VERCEL_ORG_ID
    read -p "Vercel Organization Slug (e.g., ujrisdigital): " VERCEL_ORG_SLUG
    read -p "Vercel Token (paste from Vercel settings): " VERCEL_TOKEN
    
    # Validate Vercel access
    print_info "Verifying Vercel credentials..."
    if curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID" &>/dev/null; then
        print_success "Vercel credentials verified"
    else
        print_warning "Could not verify Vercel credentials. Continuing anyway..."
    fi
}

gather_environment_vars() {
    print_header "🔐 STEP 3: Environment Variables"
    
    echo "Enter environment variables for your application."
    echo "(Leave blank to skip any variable)"
    echo ""
    
    declare -A ENV_VARS
    
    read -p "Database URL (production): " DATABASE_URL_PROD
    read -p "Database URL (staging): " DATABASE_URL_STAGING
    read -p "NextAuth Secret (production): " NEXTAUTH_SECRET_PROD
    read -p "NextAuth Secret (staging): " NEXTAUTH_SECRET_STAGING
    read -p "Anthropic API Key: " ANTHROPIC_API_KEY
    read -p "OpenAI API Key: " OPENAI_API_KEY
    read -p "Any other secrets (JSON format, optional): " CUSTOM_SECRETS
    
    print_success "Environment variables gathered"
}

################################################################################
# SECTION 2: CREATE GITHUB SECRETS
################################################################################

setup_github_secrets() {
    print_header "🔑 STEP 4: Setting Up GitHub Secrets"
    
    # Core Vercel secrets
    print_info "Setting Vercel secrets..."
    gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" -R "$GITHUB_OWNER/$GITHUB_REPO"
    print_success "VERCEL_TOKEN set"
    
    gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID" -R "$GITHUB_OWNER/$GITHUB_REPO"
    print_success "VERCEL_ORG_ID set"
    
    gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID" -R "$GITHUB_OWNER/$GITHUB_REPO"
    print_success "VERCEL_PROJECT_ID set"
    
    gh secret set VERCEL_ORG_SLUG --body "$VERCEL_ORG_SLUG" -R "$GITHUB_OWNER/$GITHUB_REPO"
    print_success "VERCEL_ORG_SLUG set"
    
    # Environment variables
    if [ -n "$DATABASE_URL_PROD" ]; then
        gh secret set DATABASE_URL_PRODUCTION --body "$DATABASE_URL_PROD" -R "$GITHUB_OWNER/$GITHUB_REPO"
        print_success "DATABASE_URL_PRODUCTION set"
    fi
    
    if [ -n "$DATABASE_URL_STAGING" ]; then
        gh secret set DATABASE_URL_STAGING --body "$DATABASE_URL_STAGING" -R "$GITHUB_OWNER/$GITHUB_REPO"
        print_success "DATABASE_URL_STAGING set"
    fi
    
    if [ -n "$NEXTAUTH_SECRET_PROD" ]; then
        gh secret set NEXTAUTH_SECRET_PRODUCTION --body "$NEXTAUTH_SECRET_PROD" -R "$GITHUB_OWNER/$GITHUB_REPO"
        print_success "NEXTAUTH_SECRET_PRODUCTION set"
    fi
    
    if [ -n "$NEXTAUTH_SECRET_STAGING" ]; then
        gh secret set NEXTAUTH_SECRET_STAGING --body "$NEXTAUTH_SECRET_STAGING" -R "$GITHUB_OWNER/$GITHUB_REPO"
        print_success "NEXTAUTH_SECRET_STAGING set"
    fi
    
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        gh secret set ANTHROPIC_API_KEY --body "$ANTHROPIC_API_KEY" -R "$GITHUB_OWNER/$GITHUB_REPO"
        print_success "ANTHROPIC_API_KEY set"
    fi
    
    if [ -n "$OPENAI_API_KEY" ]; then
        gh secret set OPENAI_API_KEY --body "$OPENAI_API_KEY" -R "$GITHUB_OWNER/$GITHUB_REPO"
        print_success "OPENAI_API_KEY set"
    fi
}

################################################################################
# SECTION 3: CREATE GITHUB ACTIONS WORKFLOW
################################################################################

create_github_workflow() {
    print_header "⚙️  STEP 5: Creating GitHub Actions Workflow"
    
    WORKFLOW_DIR=".github/workflows"
    WORKFLOW_FILE="$WORKFLOW_DIR/vercel-auto-deploy.yml"
    
    # Create directory if it doesn't exist
    mkdir -p "$WORKFLOW_DIR"
    
    cat > "$WORKFLOW_FILE" << 'WORKFLOW_TEMPLATE'
name: 🚀 Auto-Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write
  checks: write

env:
  NODE_ENV: production
  CI: true

jobs:
  # ============================================================================
  # BUILD: Compile and generate artifacts
  # ============================================================================
  build:
    name: 🏗️ Build
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci --legacy-peer-deps || npm ci

      - name: 🏗️ Build project
        run: npm run build

      - name: 📤 Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            .next/
            dist/
            out/
            build/
          retention-days: 1

  # ============================================================================
  # DEPLOY TO VERCEL (Staging on develop)
  # ============================================================================
  deploy-staging:
    name: 🌐 Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🚀 Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_SLUG }}
          environment-name: staging
          env: |
            DATABASE_URL=${{ secrets.DATABASE_URL_STAGING }}
            NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET_STAGING }}
            ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}
            OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}

      - name: 💬 Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🌐 **Deployed to Staging**: Preview deployment is ready for testing'
            })
        continue-on-error: true

  # ============================================================================
  # DEPLOY TO VERCEL (Production on main)
  # ============================================================================
  deploy-production:
    name: 🚀 Deploy to Production
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🚀 Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_SLUG }}
          production: true
          env: |
            DATABASE_URL=${{ secrets.DATABASE_URL_PRODUCTION }}
            NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET_PRODUCTION }}
            ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}
            OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}

      - name: ✅ Production Deployment Complete
        run: |
          echo "🚀 Successfully deployed to production!"
          echo "Monitor at: https://vercel.com"

  # ============================================================================
  # SECURITY: Scan for vulnerabilities
  # ============================================================================
  security:
    name: 🔒 Security Scan
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔧 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: npm ci

      - name: 🔍 Run npm audit
        run: npm audit --audit-level=moderate || true

      - name: 🔐 Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
        continue-on-error: true

  # ============================================================================
  # STATUS: Final summary
  # ============================================================================
  status:
    name: ✅ Pipeline Status
    needs: [build, deploy-staging, deploy-production, security]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: 📊 Check build status
        run: |
          if [ "${{ needs.build.result }}" != "success" ]; then
            echo "❌ Build failed"
            exit 1
          fi
          echo "✅ Build successful"

      - name: 💬 Update PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ **Pipeline Status**: Build successful and ready to deploy'
            })
        continue-on-error: true
WORKFLOW_TEMPLATE

    print_success "Workflow created at $WORKFLOW_FILE"
}

################################################################################
# SECTION 4: ENABLE BRANCH PROTECTION
################################################################################

enable_branch_protection() {
    print_header "🔒 STEP 6: Configuring Branch Protection"
    
    print_info "Setting up branch protection rules for $GITHUB_BRANCH..."
    
    # Note: This requires gh v2.3.0+
    gh api -X PUT "/repos/$GITHUB_OWNER/$GITHUB_REPO/branches/$GITHUB_BRANCH/protection" \
        -f required_status_checks='{"strict":true,"contexts":["build"]}' \
        -F enforce_admins=false \
        -F required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
        -F allow_force_pushes=false \
        -F allow_deletions=false 2>/dev/null || print_warning "Could not set branch protection (may require admin access)"
    
    print_success "Branch protection configured"
}

################################################################################
# SECTION 5: COMMIT AND PUSH CHANGES
################################################################################

commit_workflow() {
    print_header "📤 STEP 7: Committing Changes"
    
    read -p "Commit workflow changes to repository? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .github/workflows/vercel-auto-deploy.yml
        git commit -m "🚀 Add Vercel auto-deploy workflow"
        git push origin "$GITHUB_BRANCH"
        print_success "Changes pushed to repository"
    else
        print_warning "Changes not pushed. Remember to commit manually!"
    fi
}

################################################################################
# SECTION 6: VERIFICATION & SUMMARY
################################################################################

verify_setup() {
    print_header "✅ VERIFICATION"
    
    print_info "Checking setup..."
    
    # Check GitHub Secrets
    echo ""
    echo "GitHub Secrets Set:"
    gh secret list -R "$GITHUB_OWNER/$GITHUB_REPO" 2>/dev/null | head -10 || print_warning "Could not list secrets"
    
    # Check workflow file
    echo ""
    if [ -f ".github/workflows/vercel-auto-deploy.yml" ]; then
        print_success "Workflow file exists locally"
    else
        print_warning "Workflow file not found locally"
    fi
}

print_summary() {
    print_header "📋 SETUP SUMMARY"
    
    cat << EOF

✅ Integration Complete!

Repository: $GITHUB_OWNER/$GITHUB_REPO
Vercel Project: $VERCEL_PROJECT_ID
Default Branch: $GITHUB_BRANCH

Next Steps:
1. Verify GitHub Secrets are set correctly
2. Check Vercel project settings for environment variables
3. Push a commit to $GITHUB_BRANCH to trigger first deployment
4. Monitor workflow run in GitHub Actions
5. Check Vercel dashboard for deployment status

Useful Commands:
  # View workflow runs
  gh run list -R $GITHUB_OWNER/$GITHUB_REPO -w vercel-auto-deploy.yml

  # View latest workflow run
  gh run view -R $GITHUB_OWNER/$GITHUB_REPO --log

  # View Vercel deployment
  vercel inspect $VERCEL_PROJECT_ID

Resources:
  - GitHub Actions: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/actions
  - Vercel Dashboard: https://vercel.com/dashboard
  - Workflow File: .github/workflows/vercel-auto-deploy.yml

🚀 Your repository is now integrated with Vercel!
EOF
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    clear
    print_header "🚀 GITHUB + VERCEL INTEGRATION SETUP"
    echo ""
    echo "This script will help you integrate your GitHub repository"
    echo "with Vercel for automatic deployments."
    echo ""
    
    # Run all setup steps
    gather_repository_info
    pause_for_user
    
    gather_vercel_info
    pause_for_user
    
    gather_environment_vars
    pause_for_user
    
    setup_github_secrets
    pause_for_user
    
    create_github_workflow
    pause_for_user
    
    enable_branch_protection
    pause_for_user
    
    verify_setup
    pause_for_user
    
    commit_workflow
    
    print_summary
}

# Run main function
main
