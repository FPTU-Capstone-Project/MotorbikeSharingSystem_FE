# MSSUS Admin Dashboard

## Motorbike Sharing System for University Students - Admin Panel

A comprehensive admin dashboard for managing the MSSUS platform, built with React, TypeScript, and Tailwind CSS. This dashboard provides administrators with powerful tools to manage users, rides, payments, safety alerts, and analytics.

### Table of Contents

<details>
<summary>Click to expand</summary>

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

</details>

## Overview

The MSSUS Admin Dashboard is designed to provide university administrators with complete oversight and control over the motorbike sharing platform. It offers real-time monitoring, comprehensive analytics, and efficient management tools for all aspects of the system.

## Features

### Dashboard Management
- **Real-time Analytics**: Live metrics and KPIs with interactive charts
- **User Management**: Complete CRUD operations for students and drivers
- **Ride Monitoring**: Track all rides from booking to completion
- **Payment Processing**: Handle deposits, withdrawals, and ride payments
- **Safety Management**: Monitor SOS alerts and driver verification
- **Responsive Design**: Optimized for desktop and mobile devices

### Key Capabilities

<details>
<summary>User Management</summary>

- View all registered users (students and drivers)
- User verification and approval workflow
- Account status management (active, suspended, inactive)
- Driver background check processing
- Emergency contact management
- Search and filter functionality

</details>

<details>
<summary>Ride Management</summary>

- Monitor active, completed, and cancelled rides
- Track shared and solo ride distribution
- Real-time ride status updates
- Route optimization insights
- Ride history and analytics
- Integration with mapping services

</details>

<details>
<summary>Payment Management</summary>

- Process wallet deposits and withdrawals
- Monitor ride payment transactions
- Handle failed payment resolution
- Driver earnings management
- Financial reporting and analytics
- Payment method tracking

</details>

<details>
<summary>Safety & Security</summary>

- Real-time SOS alert monitoring
- Emergency response coordination
- Driver verification system
- Safety incident reporting
- Background check management
- Emergency contact integration

</details>

## Tech Stack

### Core Technologies
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### UI Components & Animation
- **Headless UI** - Unstyled, accessible components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Framer Motion** - Production-ready motion library
- **React Hot Toast** - Lightweight notification system

### Data Visualization
- **Recharts** - Composable charting library
- **Chart Types**: Line, Bar, Pie, Area, and Composed charts

### Development Tools
- **Create React App** - Zero-configuration setup
- **PostCSS** - CSS processing tool
- **Autoprefixer** - CSS vendor prefixing

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (version 16.0 or higher)
- npm or yarn package manager
- Git for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend-web-capstone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Alternative Setup (One-Command Installation)

For a completely automated setup, use the provided setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will handle all installation, dependencies, and startup processes automatically.

### Quick Start with Bash Script

We provide an automated setup script that handles everything for you:

<details>
<summary>Using the Setup Script</summary>

The setup script provides three options:

1. **Start Development Server** (Recommended for development)
   ```bash
   ./setup.sh
   # Choose option 1 when prompted
   ```

2. **Build for Production** (For deployment preparation)
   ```bash
   ./setup.sh
   # Choose option 2 when prompted
   ```

3. **Show Project Information** (For overview only)
   ```bash
   ./setup.sh
   # Choose option 3 when prompted
   ```

The script automatically:
- Checks system requirements
- Installs dependencies
- Sets up git hooks
- Provides interactive menu options
- Opens browser automatically for development

</details>

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard overview
│   ├── UserManagement.tsx
│   ├── RideManagement.tsx
│   ├── PaymentManagement.tsx
│   ├── SafetyManagement.tsx
│   └── Analytics.tsx
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type exports
├── utils/              # Utility functions
│   └── cn.ts          # Class name utility
└── App.tsx            # Main application component
```

### Component Architecture

<details>
<summary>Layout System</summary>

The dashboard uses a responsive sidebar layout that adapts to different screen sizes:
- **Desktop**: Fixed sidebar with main content area
- **Mobile**: Collapsible overlay sidebar
- **Navigation**: Active route highlighting with smooth transitions
- **Header**: Search functionality and user profile access

</details>

<details>
<summary>Page Components</summary>

Each page is designed as a self-contained module with:
- **State management** using React hooks
- **Data filtering** and search capabilities
- **Interactive modals** for detailed views
- **Real-time updates** simulation
- **Responsive design** for all screen sizes

</details>

## Key Features

### Dashboard Overview
- **KPI Cards**: Key metrics with trend indicators
- **Interactive Charts**: Revenue trends, ride distribution, peak hours
- **Recent Activity**: Real-time activity feed
- **Quick Actions**: Fast access to common tasks

### Advanced Analytics
- **Time-based Filtering**: 7 days, 30 days, 90 days, 1 year
- **Custom Date Ranges**: Flexible date selection
- **Export Functionality**: CSV and PDF report generation
- **Comparative Analysis**: Period-over-period comparisons
- **Route Analytics**: Popular routes and revenue analysis

### Safety Management
- **Priority Alerts**: Critical SOS alerts prominently displayed
- **Response Tracking**: Monitor response times and resolution
- **Driver Verification**: Background check status and approval
- **Emergency Protocols**: Quick access to emergency procedures

## Development

### Available Scripts

#### Development
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Create production build
```

#### Code Quality
```bash
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run type-check # TypeScript type checking
```

### Development Guidelines

<details>
<summary>Code Style</summary>

- Use TypeScript for all new components
- Follow React hooks patterns
- Implement proper error boundaries
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Include TypeScript types for all props and state

</details>

<details>
<summary>Component Development</summary>

When creating new components:
1. Define proper TypeScript interfaces
2. Use React.memo for performance optimization
3. Implement proper loading states
4. Add error handling
5. Include accessibility features
6. Write unit tests for complex logic

</details>

### Performance Optimizations

- **Code Splitting**: Lazy loading for route components
- **Memoization**: React.memo and useMemo for expensive operations
- **Image Optimization**: Proper image formats and lazy loading
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching**: Efficient data caching strategies

## Deployment

### Automated Deployment with Bash Script

We provide a comprehensive deployment script that handles the entire workflow:

<details>
<summary>Using the Deployment Script</summary>

**Make the script executable:**
```bash
chmod +x commit-and-deploy.sh
```

**Run the deployment script:**
```bash
./commit-and-deploy.sh
```

**Available Options:**
1. **Commit and push to GitHub only** - For code versioning
2. **Build and deploy to Vercel only** - For quick deployments
3. **Commit, push, and deploy** - Complete workflow
4. **Show deployment status** - Check current deployments
5. **Exit** - Close the script

The script automatically:
- Checks git status and handles commits
- Builds the project for production
- Deploys to Vercel with production settings
- Opens the deployment URL in your browser
- Handles error cases and provides helpful feedback

</details>

### Manual Deployment Methods

<details>
<summary>Manual Git Operations</summary>

**Initial repository setup:**
```bash
git init
git add .
git commit -m "Initial commit for MSSUS admin dashboard"
git remote add origin https://github.com/username/repository.git
git branch -M main
git push -u origin main
```

**Subsequent updates:**
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

**Branch management:**
```bash
# Create and switch to new branch
git checkout -b feature-name

# Switch back to main
git checkout main

# Merge feature branch
git merge feature-name
```

</details>

<details>
<summary>Manual Vercel Deployment</summary>

**One-time setup:**
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

**Deploy to production:**
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

**Deploy with custom settings:**
```bash
# Deploy with specific configuration
vercel --prod --name mssus-admin --regions iad1
```

**Environment variables setup:**
```bash
# Set environment variables
vercel env add REACT_APP_API_URL production
vercel env add REACT_APP_VERSION production
```

</details>

<details>
<summary>Other Deployment Platforms</summary>

**Netlify Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=build
```

**GitHub Pages:**
```bash
# Install gh-pages
npm install -g gh-pages

# Deploy to GitHub Pages
npm run build
gh-pages -d build
```

**Firebase Hosting:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize and deploy
firebase init hosting
npm run build
firebase deploy
```

**AWS S3 Static Website:**
```bash
# Build the project
npm run build

# Sync to S3 bucket (requires AWS CLI)
aws s3 sync build/ s3://your-bucket-name --delete
aws s3 website s3://your-bucket-name --index-document index.html
```

</details>

### Production Build

**Standard build process:**
```bash
npm run build
```

**Build with environment-specific configurations:**
```bash
# Development build
npm run build:dev

# Staging build  
npm run build:staging

# Production build
npm run build:prod
```

**Build analysis:**
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### Environment Configuration

<details>
<summary>Environment Variables Setup</summary>

Create environment files for different deployment stages:

**Development (.env.development):**
```bash
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_VERSION=dev
REACT_APP_DEBUG=true
```

**Staging (.env.staging):**
```bash
REACT_APP_ENV=staging
REACT_APP_API_URL=https://api-staging.mssus.com
REACT_APP_VERSION=staging
REACT_APP_DEBUG=false
```

**Production (.env.production):**
```bash
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.mssus.com
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

**Using environment variables in your code:**
```javascript
const apiUrl = process.env.REACT_APP_API_URL;
const isProduction = process.env.REACT_APP_ENV === 'production';
```

</details>

### Continuous Integration and Deployment

<details>
<summary>GitHub Actions Workflow</summary>

Create `.github/workflows/deploy.yml` for automated deployments:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

</details>

### Deployment Troubleshooting

<details>
<summary>Common Issues and Solutions</summary>

**Build failures:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf build
npm run build
```

**Git push issues:**
```bash
# Force push (use carefully)
git push --force-with-lease origin main

# Reset to remote state
git fetch origin
git reset --hard origin/main
```

**Vercel deployment issues:**
```bash
# Clear Vercel cache
vercel --debug

# Redeploy with fresh build
rm -rf .vercel
vercel --prod
```

**Environment variable issues:**
- Ensure all required variables are set in Vercel dashboard
- Check variable names start with REACT_APP_ prefix
- Verify production environment variables are different from development

</details>

## Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the coding guidelines
4. Write or update tests as needed
5. Submit a pull request

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add descriptive commit messages
4. Request review from maintainers
5. Address review feedback promptly

### Issue Reporting

When reporting issues:
- Use the provided issue templates
- Include steps to reproduce
- Provide browser and version information
- Add screenshots for UI issues

---

### Contact & Support

For questions, issues, or contributions, please:
- Open an issue on GitHub
- Follow the contributing guidelines
- Review existing documentation

### License

This project is part of an academic capstone project for FPT University students.

---

**Built with modern web technologies for the future of university transportation** 🏍️
