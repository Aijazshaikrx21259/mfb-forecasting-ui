# Forecast Adjustment Components

## Overview
Components for manual forecast overrides with approval workflow.

## Components (Planned)

### AdjustmentModal
Modal for creating/editing forecast adjustments.

### AdjustmentForm
Form with validation for adjustment details.

### AdjustmentHistory
Display audit trail of changes.

### AdjustmentTemplates
Quick-apply common adjustment scenarios.

### AdjustmentReview
Interface for approving/rejecting adjustments.

## Usage

```typescript
import { AdjustmentModal } from '@/components/adjustments/modal';

export default function ItemPage() {
  return (
    <>
      <ForecastChart />
      <AdjustmentModal itemId="P-352101" />
    </>
  );
}
```

## API Integration

- `POST /api/adjustments` - Create adjustment
- `GET /api/adjustments` - List adjustments
- `PATCH /api/adjustments/{id}` - Update adjustment
- `POST /api/adjustments/{id}/review` - Approve/reject
- `GET /api/adjustments/templates/list` - List templates

## Features

- Template-based adjustments
- Approval workflow
- Audit trail
- History tracking
- Justification required
- Confidence levels
