# Constrainly - Test Case Generator

A modern, extensible platform for generating constraint-based test cases for programming problems.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn 4.x
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)

### Installation

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd testcase-generator

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate database schema
yarn db:generate

# Run database migrations
yarn db:migrate

# Start development server
yarn dev
\`\`\`

## 📦 Package Management

This project uses **Yarn 4** with modern features:
- Zero-installs capability
- Improved performance
- Better workspace support
- Enhanced security

### Common Commands

\`\`\`bash
# Install dependencies
yarn install

# Add a dependency
yarn add package-name

# Add dev dependency  
yarn add -D package-name

# Remove dependency
yarn remove package-name

# Update dependencies
yarn up

# Database operations
yarn db:generate    # Generate Drizzle schema
yarn db:migrate     # Run migrations
yarn db:studio      # Open Drizzle Studio
\`\`\`

## 🛠️ Development

\`\`\`bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
\`\`\`

## 🗄️ Database

- **Primary DB**: Neon PostgreSQL with Drizzle ORM
- **Cache**: Upstash Redis for sessions and rate limiting
- **Auth**: NextAuth.js with Google OAuth

## 📚 Documentation

- [Environment Setup](./docs/ENVIRONMENT_SETUP.md)
- [Database Schema](./lib/db/schema.ts)
- [API Documentation](./docs/API.md)

