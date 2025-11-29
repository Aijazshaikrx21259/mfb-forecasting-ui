# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- API running and accessible

### Steps

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Vercel auto-detects Next.js

3. **Configure Environment Variables**
```
API_BASE_URL=https://your-api.onrender.com/api
API_KEY=your-api-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

4. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Visit your deployment URL

## Environment Variables

### Required
- `API_BASE_URL` - Backend API URL
- `API_KEY` - API authentication key

### Optional
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth (public)
- `CLERK_SECRET_KEY` - Clerk auth (secret)
- `API_TIMEOUT_MS` - API request timeout

## Custom Domain

1. Add domain in Vercel dashboard
2. Configure DNS records
3. Wait for SSL certificate

## Monitoring

- Check Vercel Analytics
- Monitor API response times
- Set up error tracking (Sentry)

## Troubleshooting

### Build Failures
- Check Node.js version (18+)
- Verify all dependencies installed
- Check TypeScript errors

### API Connection Issues
- Verify API_BASE_URL is correct
- Check CORS settings on API
- Verify API_KEY matches backend

### Authentication Issues
- Check Clerk keys are correct
- Verify redirect URLs in Clerk dashboard
- Check environment variables are set
