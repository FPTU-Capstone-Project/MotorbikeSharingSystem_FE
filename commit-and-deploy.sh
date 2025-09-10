#!/bin/bash

# MSSUS Admin Dashboard - Commit and Deploy Script
# This script handles git operations and deployment to Vercel
# Usage: chmod +x commit-and-deploy.sh && ./commit-and-deploy.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE} MSSUS Commit & Deploy Tool${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check git status
check_git_status() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        print_error "Not a git repository. Please run 'git init' first."
        exit 1
    fi
    
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "No changes to commit"
        return 1
    fi
    
    return 0
}

# Function to get commit message from user
get_commit_message() {
    echo -e "${CYAN}Enter your commit message:${NC}"
    read -p "Message: " commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update MSSUS admin dashboard"
        print_status "Using default commit message: $commit_message"
    fi
    
    echo "$commit_message"
}

# Function to commit changes
commit_changes() {
    local message="$1"
    
    print_status "Adding all changes to git..."
    git add .
    
    print_status "Committing changes..."
    git commit -m "$message

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    print_success "Changes committed successfully"
}

# Function to push to GitHub
push_to_github() {
    print_status "Checking git remote..."
    
    if ! git remote get-url origin >/dev/null 2>&1; then
        print_warning "No remote origin found. Please set up your GitHub repository first."
        echo "Example: git remote add origin https://github.com/username/repository.git"
        return 1
    fi
    
    # Check current branch
    current_branch=$(git branch --show-current)
    print_status "Current branch: $current_branch"
    
    print_status "Pushing to GitHub..."
    if git push origin "$current_branch"; then
        print_success "Successfully pushed to GitHub"
        return 0
    else
        # If push fails, try with upstream
        print_status "Setting upstream and pushing..."
        git push -u origin "$current_branch"
        print_success "Successfully pushed to GitHub with upstream"
        return 0
    fi
}

# Function to build project
build_project() {
    print_status "Building project for production..."
    
    if command_exists yarn; then
        yarn build
    else
        npm run build
    fi
    
    if [ -d "build" ]; then
        print_success "Project built successfully"
        return 0
    else
        print_error "Build failed"
        return 1
    fi
}

# Function to deploy to Vercel
deploy_to_vercel() {
    if ! command_exists vercel; then
        print_status "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_status "Deploying to Vercel..."
    
    # Deploy to production
    deployment_url=$(vercel --prod --yes)
    
    if [ $? -eq 0 ]; then
        print_success "Successfully deployed to Vercel"
        echo -e "${CYAN}Deployment URL: ${GREEN}$deployment_url${NC}"
        
        # Try to open in browser
        if command_exists open; then
            open "$deployment_url"
        elif command_exists xdg-open; then
            xdg-open "$deployment_url"
        fi
        
        return 0
    else
        print_error "Deployment to Vercel failed"
        return 1
    fi
}

# Function to show deployment status
show_deployment_info() {
    if command_exists vercel; then
        print_status "Current Vercel deployments:"
        vercel list
    fi
}

# Main menu function
show_menu() {
    echo -e "${CYAN}What would you like to do?${NC}"
    echo "1) Commit and push to GitHub only"
    echo "2) Build and deploy to Vercel only"
    echo "3) Commit, push, and deploy (full workflow)"
    echo "4) Show deployment status"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    echo ""
    
    echo "$choice"
}

# Main execution flow
main() {
    print_header
    
    choice=$(show_menu)
    
    case $choice in
        1)
            if check_git_status; then
                commit_message=$(get_commit_message)
                commit_changes "$commit_message"
                push_to_github
            fi
            ;;
        2)
            if build_project; then
                deploy_to_vercel
            fi
            ;;
        3)
            if check_git_status; then
                commit_message=$(get_commit_message)
                commit_changes "$commit_message"
                
                if push_to_github; then
                    if build_project; then
                        deploy_to_vercel
                    fi
                fi
            else
                print_status "No changes to commit, proceeding with deployment..."
                if build_project; then
                    deploy_to_vercel
                fi
            fi
            ;;
        4)
            show_deployment_info
            ;;
        5)
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_warning "Invalid choice. Running full workflow..."
            if check_git_status; then
                commit_message=$(get_commit_message)
                commit_changes "$commit_message"
                push_to_github
            fi
            
            if build_project; then
                deploy_to_vercel
            fi
            ;;
    esac
    
    print_success "Operation completed!"
}

# Trap to handle interruptions
trap 'echo -e "\n${YELLOW}Operation interrupted by user${NC}"; exit 130' INT

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found in current directory"
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Run main function
main