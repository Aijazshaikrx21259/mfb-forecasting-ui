# Data Quality Components

## Overview
Components for monitoring data quality and managing anomalies.

## Components (Planned)

### DataQualityDashboard
Main dashboard showing quality metrics and issues.

### QualityMetricsCards
Cards displaying completeness, accuracy, and anomaly counts.

### AnomalyCandidatesTable
Table of detected anomalies with flag management.

### FlagManagementInterface
UI for creating and managing data quality flags.

### QualityTrendChart
Visualization of quality metrics over time.

## Usage

```typescript
import { DataQualityDashboard } from '@/components/data-quality/dashboard';

export default function QualityPage() {
  return <DataQualityDashboard />;
}
```

## API Integration

- `GET /api/data-quality/flags` - List quality flags
- `POST /api/data-quality/flags` - Create flag
- `GET /api/data-quality/candidates` - Anomaly candidates
- `POST /api/data-quality/flags/deactivate` - Deactivate flag

## Features

- Real-time quality monitoring
- Anomaly detection
- Flag management
- Export reports
- Historical tracking
