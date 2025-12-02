# Frontend Test Coverage Demo

Complex frontend application demonstrating test coverage capabilities.

## Technology Stack

- React 18
- TypeScript
- Jest
- React Testing Library

## Project Structure

```
src/
├── components/
│   ├── UserProfile.tsx
│   ├── ShoppingCart.tsx
│   └── __tests__/
├── hooks/
│   ├── useDebounce.ts
│   └── __tests__/
├── utils/
│   ├── validation.ts
│   ├── pricing.ts
│   ├── helpers.ts
│   └── __tests__/
├── services/
│   ├── api.ts
│   └── __tests__/
└── types/
    └── index.ts
```

## Running Tests

```bash
npm install
npm test
```

## Coverage Report

```bash
npm test -- --coverage
```

## Features

- User profile management with validation
- Shopping cart with discount codes
- Utility functions for validation and formatting
- Custom React hooks
- API service layer

## Test Coverage Areas

- Component rendering and interactions
- Form validation
- State management
- API calls
- Utility functions
- Custom hooks
