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

## 🚀 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/testcase-generator)

Make sure to set up environment variables in your Vercel dashboard.
\`\`\`

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shashanksingh2002s-projects/v0-test-case-generator-bf)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/BxBAKKngXOt)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/shashanksingh2002s-projects/v0-test-case-generator-bf](https://vercel.com/shashanksingh2002s-projects/v0-test-case-generator-bf)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/BxBAKKngXOt](https://v0.dev/chat/projects/BxBAKKngXOt)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
