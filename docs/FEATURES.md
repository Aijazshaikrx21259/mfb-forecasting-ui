# Features Documentation

## Alert System (US #11, #17)

### Overview
Real-time in-app notification system for forecast events and system alerts.

### Components
- **AlertBell**: Notification bell with unread count badge
- **AlertList**: Scrollable list of alerts with actions
- **AlertsPage**: Full-page alert management
- **AlertPreferences**: User customization settings

### Features
- Real-time polling (30-second intervals)
- Mark as read/dismissed
- Priority-based filtering
- Alert type customization
- Weekly digest preferences
- Deep linking to relevant pages

### API Integration
- `GET /api/alerts` - List alerts
- `PATCH /api/alerts/{id}` - Update alert status
- `POST /api/alerts/mark-all-read` - Bulk action
- `GET /api/alert-preferences` - Get preferences
- `PUT /api/alert-preferences` - Update preferences

---

## Forecast Adjustments (US #18)

### Overview
Manual forecast override system with approval workflow.

### Features (Planned)
- Create adjustments with justification
- Template-based adjustments
- Approval workflow
- Audit trail
- History tracking

---

## Backtest Dashboard (US #14)

### Overview
Performance tracking and model evaluation dashboard.

### Features (Planned)
- MAPE/RMSE metrics
- Horizon comparison
- Per-item performance
- Trend visualization
- Export functionality

---

## Data Quality Monitoring (US #21)

### Overview
Data quality management and anomaly detection.

### Features (Planned)
- Quality metrics cards
- Anomaly candidates
- Flag management
- Quality reports
- Export functionality

---

## Model Transparency (US #13)

### Overview
Insight into forecasting model selection and performance.

### Features (Planned)
- Champion model display
- Selection criteria
- Performance comparison
- Retraining history
