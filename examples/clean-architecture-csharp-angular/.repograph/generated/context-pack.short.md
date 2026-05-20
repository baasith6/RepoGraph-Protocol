# Task Context

## Task
general development and maintenance

## Relevant Modules

### Auth (critical)
Authentication and authorization

### Shared
Shared utilities and samples

## Relevant Files

- `src/Web/Auth/AuthController.cs`
- `src/Infrastructure/Auth/AuthRepository.cs`
- `src/Domain/Auth/User.cs`
- `src/Application/Auth/LoginCommand.cs`
- `client/src/app/auth/login.component.ts`
- `client/src/app/auth/auth.service.ts`
- `src/Web/Violation/BadDependency.cs`

## Architecture Rules

- **no-web-to-infrastructure:** Web must not directly depend on Infrastructure

## Risk Warnings

- **[critical]** `src/**/Auth/**` — Authentication flows
- **[high]** `src/Web/Violation/**` — Demonstrates architecture violation patterns

## Suggested Tests

- tests/Auth/LoginTests.cs

## Forbidden Edits

Do not modify files matching:
- `node_modules/**`
- `bin/**`
- `obj/**`

## Suggested Approach

1. Work only within the modules and files listed above
2. Follow architecture rules before editing
3. Add or update tests in the suggested test paths
4. Request review from listed owners for high-risk modules