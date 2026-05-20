export type TemplateName = "clean-architecture-csharp-angular" | "default";

export interface TemplateFile {
  path: string;
  content: string;
}

export function getTemplate(name: TemplateName): TemplateFile[] {
  switch (name) {
    case "clean-architecture-csharp-angular":
      return cleanArchitectureTemplate();
    default:
      return defaultTemplate();
  }
}

function protocolStubFiles(): TemplateFile[] {
  return [
    {
      path: "api.yml",
      content: `# Map HTTP endpoints to modules (auto-filled on repograph scan when detected)
apis: []
`,
    },
    {
      path: "database.yml",
      content: `# Map database entities to modules (auto-filled on repograph scan when detected)
database:
  provider: unknown
  entities: []
`,
    },
    {
      path: "risk.yml",
      content: `# Path-based risk rules
risks:
  - path: "src/**/Auth/**"
    risk: critical
    reason: Authentication flows
`,
    },
    {
      path: "ownership.yml",
      content: `# Team and module ownership
owners: {}
`,
    },
    {
      path: "glossary.yml",
      content: `# Domain terminology
glossary: []
`,
    },
  ];
}

function defaultTemplate(): TemplateFile[] {
  return [
    {
      path: "project.yml",
      content: `protocol:
  name: RepoGraph
  version: 0.2.0

project:
  name: MyProject
  description: Project description
  type: Application
  architecture: Layered
  primary_language: TypeScript

repository:
  provider: GitHub
  default_branch: main
`,
    },
    {
      path: "modules.yml",
      content: `modules:
  - name: Core
    description: Core application module
    paths:
      - "src/**"
`,
    },
    {
      path: "architecture.yml",
      content: `architecture:
  style: Layered

layers:
  Core:
    path: "src"
    allowed_dependencies: []

rules: []
`,
    },
    {
      path: "rules.yml",
      content: `rules: []

enforcement:
  mode: error
`,
    },
    {
      path: "tests.yml",
      content: `tests: []
`,
    },
    {
      path: "ai.yml",
      content: `ai:
  instructions:
    - Follow project architecture rules
    - Run tests before completing changes
  exclude_paths:
    - "node_modules/**"
    - "dist/**"
  risk_warnings: []
`,
    },
    ...protocolStubFiles(),
    {
      path: "decisions/ADR-001-example.md",
      content: `# ADR-001: Example Architecture Decision

## Status
Accepted

## Context
Describe the problem or context.

## Decision
Describe the decision made.

## Consequences
Describe positive and negative consequences.
`,
    },
  ];
}

function cleanArchitectureTemplate(): TemplateFile[] {
  return [
    {
      path: "project.yml",
      content: `protocol:
  name: RepoGraph
  version: 0.2.0

project:
  name: CarRentalSystem
  description: Multi-role car rental management platform
  type: Modular Monolith
  architecture: Clean Architecture
  primary_language: C#
  secondary_languages:
    - TypeScript
    - HTML
    - CSS

repository:
  provider: GitHub
  default_branch: main
`,
    },
    {
      path: "modules.yml",
      content: `modules:
  - name: Auth
    description: Authentication and authorization
    paths:
      - "src/**/Auth/**"
      - "client/src/app/auth/**"
    critical: true

  - name: Booking
    description: Booking management
    paths:
      - "src/**/Booking/**"
      - "client/src/app/booking/**"

  - name: Shared
    description: Shared utilities and cross-cutting concerns
    paths:
      - "src/Shared/**"
      - "src/Web/Violation/**"
      - "client/src/app/shared/**"
`,
    },
    {
      path: "architecture.yml",
      content: `architecture:
  style: Clean Architecture

layers:
  Domain:
    path: "src/Domain"
    allowed_dependencies: []

  Application:
    path: "src/Application"
    allowed_dependencies:
      - Domain

  Infrastructure:
    path: "src/Infrastructure"
    allowed_dependencies:
      - Application
      - Domain

  Web:
    path: "src/Web"
    allowed_dependencies:
      - Application

rules:
  - id: no-web-to-infrastructure
    description: Web must not directly depend on Infrastructure
    severity: error
`,
    },
    {
      path: "rules.yml",
      content: `rules:
  - id: no-web-to-infrastructure
    description: Web layer must not reference Infrastructure layer
    severity: error
    type: forbidden-dependency
    from: Web
    to: Infrastructure
    forbidden: true

enforcement:
  mode: error
`,
    },
    {
      path: "tests.yml",
      content: `tests:
  - module: Auth
    paths:
      - "tests/Auth/**"
    description: Authentication tests

  - module: Booking
    paths:
      - "tests/Booking/**"
    description: Booking tests
`,
    },
    {
      path: "ai.yml",
      content: `ai:
  instructions:
    - Follow Clean Architecture layer rules strictly
    - Domain layer must not depend on any other layer
    - Web layer must not access Infrastructure directly
    - Always validate TenantId in multi-tenant operations
    - Run related tests after changes to critical modules
  exclude_paths:
    - "node_modules/**"
    - "bin/**"
    - "obj/**"
    - "**/Migrations/**"
  risk_warnings:
    - Auth module is critical - extra care required
    - Database migrations are high risk
`,
    },
    ...protocolStubFiles(),
    {
      path: "decisions/ADR-001-clean-architecture.md",
      content: `# ADR-001: Clean Architecture

## Status
Accepted

## Context
The project requires clear separation of concerns for maintainability and testability.

## Decision
Adopt Clean Architecture with Domain, Application, Infrastructure, and Web layers.

## Consequences
- Clear dependency direction enforced by RepoGraph
- More boilerplate but better long-term maintainability
`,
    },
  ];
}
