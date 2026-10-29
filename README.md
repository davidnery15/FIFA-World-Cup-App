# FIFA-World-Cup-App

## Backend tests

Run the backend API tests without connecting to a live MongoDB instance:

```bash
pnpm --filter backend test
```

Check backend test coverage and its enforced thresholds:

```bash
pnpm --filter backend test:coverage
```

Run the production build and test type-check:

```bash
pnpm --filter backend build
pnpm --filter backend typecheck:test
```
