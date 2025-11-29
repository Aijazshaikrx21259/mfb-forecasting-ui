# Backtest Components

## Overview
Components for displaying backtest performance metrics and model evaluation.

## Components (Planned)

### BacktestDashboard
Main dashboard showing overall performance metrics.

### BacktestSummaryCards
Cards displaying MAPE, RMSE, and other key metrics.

### BacktestChart
Performance trend visualization over time.

### BacktestTable
Per-item performance breakdown with sorting and filtering.

### HorizonComparison
Compare performance across different forecast horizons.

## Usage

```typescript
import { BacktestDashboard } from '@/components/backtest/backtest-dashboard';

export default function BacktestPage() {
  return <BacktestDashboard />;
}
```

## API Integration

- `GET /api/backtest/summary` - Overall metrics
- `GET /api/backtest/items` - Per-item performance
- `POST /api/backtest/run` - Trigger new backtest

## Features

- Real-time metrics
- Export to CSV
- Horizon comparison
- Model performance tracking
- Historical trends
