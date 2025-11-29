# Testing Guide

## Overview
Testing strategy for the MFB Forecasting UI application.

## Test Types (Planned)

### Unit Tests
- Component testing with Jest
- Utility function tests
- Hook tests

### Integration Tests
- API client tests
- Component integration tests
- User flow tests

### E2E Tests
- Playwright for end-to-end testing
- Critical user journeys
- Cross-browser testing

## Running Tests

```bash
# Run all tests (when implemented)
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Structure

```
__tests__/
├── components/      # Component tests
├── lib/            # Utility tests
├── hooks/          # Hook tests
└── e2e/            # End-to-end tests
```

## Best Practices

1. **Test user behavior, not implementation**
2. **Use meaningful test descriptions**
3. **Keep tests isolated and independent**
4. **Mock external dependencies**
5. **Test edge cases and error states**

## Coverage Goals

- Overall: > 80%
- Critical paths: > 90%
- New features: 100%

## CI/CD Integration

Tests will run automatically on:
- Pull requests
- Push to main branch
- Pre-deployment checks
