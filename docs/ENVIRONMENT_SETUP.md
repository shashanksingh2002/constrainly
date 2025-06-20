# Environment Setup Guide

This guide will help you set up all the required environment variables for the Constrainly testcase generator.

## Quick Start

1. **Copy the example file:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Fill in the required variables** (see sections below)

3. **Generate database schema:**
   \`\`\`bash
   pnpm db:generate
   pnpm db:migrate
   \`\`\`

4. **Start development:**
   \`\`\`bash
   pnpm dev
   \`\`\`

## Required Services Setup

### 1. Neon Database (PostgreSQL)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Set `DATABASE_URL` in your `.env.local`

### 2. Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST API URL and Token
4. Set `KV_REST_API_URL` and `KV_REST_API_TOKEN`

### 3. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.vercel.app/api/auth/callback/google` (production)
6. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 4. NextAuth Secret

Generate a secure secret:
\`\`\`bash
openssl rand -base64 32
\`\`\`
Set this as `NEXTAUTH_SECRET`

## Production Deployment (Vercel)

1. **Push your code to GitHub**
2. **Connect to Vercel**
3. **Set environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add all the variables from your `.env.local`
   - Make sure to update `NEXTAUTH_URL` to your production domain

## Troubleshooting

### Common Issues

1. **Google OAuth Error**: Make sure redirect URIs match exactly
2. **Database Connection**: Check if your IP is whitelisted in Neon
3. **Redis Connection**: Verify your Upstash credentials
4. **NextAuth Error**: Ensure `NEXTAUTH_SECRET` is set in production

### Debug Mode

Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
\`\`\`

## Optional Enhancements

- **Email notifications**: Add SMTP configuration
- **File uploads**: Add AWS S3 or Vercel Blob storage
- **Error tracking**: Add Sentry configuration
- **Analytics**: Add Vercel Analytics or Google Analytics
