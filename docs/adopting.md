# Adopting RepoGraph in an Existing Project

This guide helps you add RepoGraph to a project that already uses Clean Architecture (or similar layering).

## 1. Run init with the closest template

```bash
repograph init --template clean-architecture-csharp-angular
```

## 2. Map business modules (`modules.yml`)

List each business capability and the path globs that belong to it:

```yaml
modules:
  - name: Auth
    paths:
      - "src/**/Auth/**"
      - "client/src/app/auth/**"
    critical: true

  - name: Booking
    paths:
      - "src/**/Booking/**"
      - "client/src/app/booking/**"
```

Tips:

- Use `**` for nested feature folders
- Mark payment, auth, and tenant modules as `critical: true`
- Run `repograph scan` and review unmapped files in `repograph stats`

## 3. Define layers (`architecture.yml`)

Match your folder structure:

```yaml
layers:
  Domain:
    path: "src/Domain"
    allowed_dependencies: []

  Application:
    path: "src/Application"
    allowed_dependencies: [Domain]

  Infrastructure:
    path: "src/Infrastructure"
    allowed_dependencies: [Application, Domain]

  Web:
    path: "src/Web"
    allowed_dependencies: [Application]
```

## 4. Add enforcement rules (`rules.yml`)

```yaml
rules:
  - id: no-web-to-infrastructure
    description: Web must not reference Infrastructure
    severity: error
    type: forbidden-dependency
    from: Web
    to: Infrastructure

enforcement:
  mode: error
```

## 5. Link tests (`tests.yml`)

```yaml
tests:
  - module: Auth
    paths:
      - "tests/Auth/**"
```

## 6. Configure AI context (`ai.yml`)

```yaml
ai:
  instructions:
    - Follow Clean Architecture layer rules
    - Never access DbContext from Web layer
  risk_warnings:
    - Auth changes require extra review
```

## 7. Validate in CI

Add the [GitHub Action](../action/action.yml) to pull requests so violations block merges.

## Common issues

| Issue | Fix |
|-------|-----|
| Many unmapped files | Add broader globs or a `Shared` module |
| False layer violations | Ensure `using` targets match layer folder names; use Roslyn mode (v0.2+) |
| Check passes but PR is wrong | Run `repograph diff --base main` (v0.2+) |
