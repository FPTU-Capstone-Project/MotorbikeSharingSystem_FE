#!/bin/bash

# MSSUS Admin Dashboard - Automated Setup Script
# This script will set up the entire project environment automatically
# Usage: chmod +x setup.sh && ./setup.sh

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
    echo -e "${PURPLE} MSSUS Admin Dashboard Setup${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        
        if [ "$MAJOR_VERSION" -lt 16 ]; then
            print_error "Node.js version $NODE_VERSION detected. Version 16 or higher required."
            print_status "Please update Node.js: https://nodejs.org/"
            exit 1
        else
            print_success "Node.js version $NODE_VERSION detected"
        fi
    else
        print_error "Node.js not found. Please install Node.js 16 or higher."
        print_status "Visit https://nodejs.org/ to download and install Node.js"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ -f "package.json" ]; then
        if command_exists yarn; then
            print_status "Using Yarn package manager"
            yarn install --silent
        else
            print_status "Using npm package manager"
            npm install --silent --no-fund --no-audit
        fi
        print_success "Dependencies installed successfully"
    else
        print_error "package.json not found. Make sure you're in the correct directory."
        exit 1
    fi
}

# Function to check if project is already built
check_build() {
    if [ -d "build" ]; then
        print_warning "Build directory already exists"
        read -p "Do you want to rebuild? (y/N): " rebuild
        if [[ $rebuild =~ ^[Yy]$ ]]; then
            rm -rf build
            return 0
        else
            return 1
        fi
    fi
    return 0
}

# Function to build project
build_project() {
    if check_build; then
        print_status "Building project for production..."
        
        if command_exists yarn; then
            yarn build --silent
        else
            npm run build --silent
        fi
        
        if [ -d "build" ]; then
            print_success "Project built successfully"
            BUILD_SIZE=$(du -sh build | cut -f1)
            print_status "Build size: $BUILD_SIZE"
        else
            print_error "Build failed"
            exit 1
        fi
    else
        print_status "Skipping build step"
    fi
}

# Function to start development server
start_dev_server() {
    print_status "Starting development server..."
    print_status "The application will open at http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    echo ""
    print_success "Setup completed! Starting development server..."
    echo ""
    
    # Open browser (works on macOS and Linux)
    if command_exists open; then
        sleep 3 && open "http://localhost:3000" &
    elif command_exists xdg-open; then
        sleep 3 && xdg-open "http://localhost:3000" &
    fi
    
    if command_exists yarn; then
        yarn start
    else
        npm start
    fi
}

# Function to display project info
show_project_info() {
    echo ""
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN} Project Information${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo -e "Project Name:     ${GREEN}MSSUS Admin Dashboard${NC}"
    echo -e "Description:      ${GREEN}Motorbike Sharing System Admin Panel${NC}"
    echo -e "Technology Stack: ${GREEN}React + TypeScript + Tailwind CSS${NC}"
    echo -e "Port:             ${GREEN}http://localhost:3000${NC}"
    echo ""
    echo -e "${CYAN}Available Commands:${NC}"
    echo -e "  ${YELLOW}npm start${NC}        Start development server"
    echo -e "  ${YELLOW}npm test${NC}         Run test suite"
    echo -e "  ${YELLOW}npm run build${NC}    Create production build"
    echo ""
    echo -e "${CYAN}Features:${NC}"
    echo -e "  ✅ User Management"
    echo -e "  ✅ Ride Tracking"
    echo -e "  ✅ Payment Processing"
    echo -e "  ✅ Safety Management"
    echo -e "  ✅ Analytics Dashboard"
    echo -e "  ✅ Responsive Design"
    echo ""
}

# Function to check system requirements
check_system_requirements() {
    print_status "Checking system requirements..."
    
    # Check operating system
    OS=$(uname -s)
    print_status "Operating System: $OS"
    
    # Check available memory
    if command_exists free; then
        MEMORY=$(free -m | grep '^Mem:' | awk '{print $2}')
        print_status "Available Memory: ${MEMORY}MB"
        
        if [ "$MEMORY" -lt 2048 ]; then
            print_warning "Low memory detected. Build process may be slow."
        fi
    fi
    
    # Check disk space
    if command_exists df; then
        DISK_SPACE=$(df -h . | tail -1 | awk '{print $4}')
        print_status "Available Disk Space: $DISK_SPACE"
    fi
}

# Function to setup git hooks (if git repo exists)
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_status "Git repository detected"
        
        # Create a simple pre-commit hook
        if [ ! -f ".git/hooks/pre-commit" ]; then
            print_status "Setting up git pre-commit hook..."
            cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Simple pre-commit hook
echo "Running pre-commit checks..."

# Check for TypeScript errors
if command -v npm >/dev/null 2>&1; then
    npm run build >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Build failed. Please fix TypeScript errors before committing."
        exit 1
    fi
fi
EOF
            chmod +x .git/hooks/pre-commit
            print_success "Git pre-commit hook installed"
        fi
    fi
}

# Main execution flow
main() {
    print_header
    
    # Check system requirements
    check_system_requirements
    echo ""
    
    # Check Node.js
    print_status "Checking Node.js installation..."
    check_node_version
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Setup git hooks
    setup_git_hooks
    echo ""
    
    # Ask user what they want to do
    echo -e "${YELLOW}What would you like to do?${NC}"
    echo "1) Start development server (recommended)"
    echo "2) Build for production"
    echo "3) Show project information only"
    echo ""
    read -p "Enter your choice (1-3): " choice
    echo ""
    
    case $choice in
        1)
            show_project_info
            start_dev_server
            ;;
        2)
            build_project
            show_project_info
            print_success "Setup completed! Your production build is ready in the 'build' folder."
            ;;
        3)
            show_project_info
            print_success "Setup completed! Run 'npm start' to begin development."
            ;;
        *)
            print_warning "Invalid choice. Starting development server..."
            show_project_info
            start_dev_server
            ;;
    esac
}

# Trap to handle interruptions
trap 'echo -e "\n${YELLOW}Setup interrupted by user${NC}"; exit 130' INT

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found in current directory"
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Run main function
main