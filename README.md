## MFB Forecasting UI

Next.js dashboard that consumes the forecasting API (`mfb-forecasting-api`) to display planning suggestions, item drill-downs, and model health.

## Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- Forecasting API running locally on port `8000`
- API key: defaults to `change-me` in both services

## Setup

1. Copy the sample environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Adjust any values as needed. By default the UI calls `http://127.0.0.1:8000/api` and sends `X-API-Key: change-me`, which matches the backend defaults.
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the dev server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The `/items` page pulls the next-month plan and backtest summaries. If the API cannot be reached, the UI now shows a configuration hint so you can confirm the backend is running and the API key/base URL are correct.

## Production build

```bash
npm run build
npm run start
```

Set `API_BASE_URL` / `API_KEY` (or their `NEXT_PUBLIC_*` variants) in your hosting environment.
