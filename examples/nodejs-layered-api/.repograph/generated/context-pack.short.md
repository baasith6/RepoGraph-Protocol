# Task Context

## Task
general development and maintenance

## Relevant Modules

### Orders (critical)
Order placement and retrieval

## Relevant Files

- `src/services/order.service.ts`
- `src/domain/order.ts`
- `src/api/orders.controller.ts`

## Architecture Rules

- **api-no-domain:** API layer must not import Domain directly

## Suggested Tests

- Add or update tests for module Orders related to: general development and maintenance

## Forbidden Edits

Do not modify files matching:
- `node_modules/**`
- `dist/**`

## Suggested Approach

1. Work only within the modules and files listed above
2. Follow architecture rules before editing
3. Add or update tests in the suggested test paths
4. Request review from listed owners for high-risk modules