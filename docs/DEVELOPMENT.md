# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API running (see mfb-forecasting-api)

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Required variables:
- `API_BASE_URL` - Backend API URL
- `API_KEY` - API authentication key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key (optional)
- `CLERK_SECRET_KEY` - Clerk secret key (optional)

### Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
app/
├── (workspace)/        # Authenticated routes
│   ├── items/         # Item browsing
│   ├── purchase-plan/ # Purchase planning
│   └── alerts/        # Alert management
├── layout.tsx         # Root layout
└── page.tsx           # Landing page

components/
├── alerts/            # Alert components
├── item/              # Item components
├── ui/                # shadcn/ui components
└── site-header.tsx    # Navigation

lib/
├── api/               # API clients
│   ├── alerts.ts
│   ├── forecast.ts
│   └── backtest.ts
├── api-client.ts      # Base API client
└── utils.ts           # Utilities
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Tailwind CSS for styling
- shadcn/ui components

## Adding New Features

### 1. Create API Client
```typescript
// lib/api/feature.ts
export async function getFeature() {
  return apiFetch<FeatureResponse>('/feature');
}
```

### 2. Create Components
```typescript
// components/feature/feature-component.tsx
"use client";
export function FeatureComponent() {
  // Implementation
}
```

### 3. Add Route
```typescript
// app/(workspace)/feature/page.tsx
export default function FeaturePage() {
  return <FeatureComponent />;
}
```

### 4. Update Navigation
Add to `components/site-header.tsx`

## Testing

### Component Tests (Planned)
```bash
npm test
```

### E2E Tests (Planned)
```bash
npm run test:e2e
```

## Building

### Production Build
```bash
npm run build
npm start
```

### Static Export
```bash
npm run build
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker
```bash
docker build -t mfb-ui .
docker run -p 3000:3000 mfb-ui
```

## Troubleshooting

### API Connection Issues
- Verify `API_BASE_URL` is correct
- Check API is running
- Verify `API_KEY` matches backend

### Build Errors
- Clear `.next` folder
- Delete `node_modules` and reinstall
- Check Node.js version

### Clerk Authentication
- Verify Clerk keys are set
- Check Clerk dashboard for issues
- Ensure redirect URLs are configured

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Clerk Docs](https://clerk.com/docs)
