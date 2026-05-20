# PRD: **RepoGraph Protocol**

## 1. Product Summary

**RepoGraph Protocol** is an open-source standard, CLI, scanner engine, and integration toolkit that converts a software repository into a **machine-readable codebase knowledge graph**.

Its purpose is to help:

* AI coding tools understand the project correctly.
* Developers onboard faster.
* Teams enforce architecture rules.
* CI pipelines detect risky structural changes.
* Documentation stay connected to real code.
* Code review become more context-aware.

**Product tagline:**

> Machine-readable context for human and AI developers.

---

## 2. Core Vision

Modern repositories have files, code, tests, APIs, documentation, configs, and architecture decisions scattered everywhere.

AI tools and new developers usually guess the structure.

RepoGraph solves that by creating a standard layer:

```txt
.repograph/
  project.yml
  modules.yml
  architecture.yml
  rules.yml
  api.yml
  database.yml
  glossary.yml
  decisions/
  generated/
```

This becomes the official **context layer** for the repository.

---

## 3. Hard Truth

This project is only revolutionary if it becomes a **standard**, not just a CLI.

A CLI alone is small.

The real value is:

```txt
RepoGraph file format
+ Scanner engine
+ Architecture rule engine
+ AI context exporter
+ CI integration
+ IDE integration
+ Community templates
```

The open-source project should be built as a **protocol-first ecosystem**, not a single utility script.

---

# 4. Target Users

## 4.1 Primary Users

| User                     | Need                                                            |
| ------------------------ | --------------------------------------------------------------- |
| Solo developers          | Understand and control large projects with AI tools             |
| Open-source maintainers  | Help contributors understand architecture before submitting PRs |
| Team leads               | Enforce architecture rules                                      |
| New developers           | Learn a codebase faster                                         |
| AI-assisted developers   | Generate better context for Cursor, Claude Code, Copilot, etc.  |
| Clean Architecture teams | Prevent dependency violations                                   |
| Modular monolith teams   | Understand module boundaries                                    |
| Enterprise teams         | Maintain governance and documentation                           |

---

# 5. Problem Statement

Developers and AI tools struggle to understand:

```txt
- What the project does
- Which modules exist
- Which files belong to which module
- Which layers can depend on which layers
- Which files are sensitive
- Which APIs belong to which features
- Which database tables belong to which modules
- Which tests protect which behavior
- Which business rules must not be broken
- Which architectural decisions explain the current design
```

Current tools solve parts of this:

| Tool Type                | Limitation                                    |
| ------------------------ | --------------------------------------------- |
| README                   | Human-readable only, usually outdated         |
| OpenAPI                  | API-only, not architecture-aware              |
| Static analyzers         | Language-specific, not business-context aware |
| Architecture tests       | Useful but not standardized                   |
| AI tools                 | Guess context from files                      |
| Documentation generators | Explain code, not system intent               |
| Dependency graphs        | Show imports, not project meaning             |

RepoGraph fills the missing layer:

> A structured, machine-readable system map of the repository.

---

# 6. Product Goals

## 6.1 Main Goals

RepoGraph must:

1. Define a standard `.repograph` protocol.
2. Scan repositories and generate a codebase graph.
3. Explain project architecture to humans.
4. Export structured context to AI tools.
5. Validate architecture rules.
6. Detect dependency violations.
7. Map modules, files, APIs, database tables, and tests.
8. Support CI/CD checks.
9. Support IDE and editor integrations.
10. Become language-extensible through plugins.

---

# 7. Non-Goals

RepoGraph should **not** become:

| Not This                             | Reason                                |
| ------------------------------------ | ------------------------------------- |
| Full AI coding agent                 | Too crowded and unfocused             |
| Documentation website generator only | Too small                             |
| Static analyzer replacement          | Existing tools already do this deeply |
| Security scanner                     | Different problem                     |
| Package manager                      | Not relevant                          |
| Code formatter                       | Not relevant                          |
| General project management tool      | Scope creep                           |
| Cloud-only SaaS                      | Bad for open-source adoption          |

RepoGraph should stay focused on:

```txt
Codebase structure
Architecture rules
Machine-readable context
AI-safe project understanding
```

---

# 8. Product Modules

No phase-based breakdown. These are the full modules needed.

---

## Module 1: **RepoGraph Protocol Specification**

This is the heart of the product.

### Purpose

Define the standard `.repograph` structure and schema.

### Required Files

```txt
.repograph/
  project.yml
  modules.yml
  architecture.yml
  dependencies.yml
  rules.yml
  api.yml
  database.yml
  tests.yml
  glossary.yml
  ai.yml
  ownership.yml
  risk.yml
  decisions/
    ADR-001-example.md
  generated/
    graph.json
    graph.mmd
    context-pack.md
```

### Feature Requirements

| Feature             | Description                                       |
| ------------------- | ------------------------------------------------- |
| Protocol versioning | Every repo must define RepoGraph protocol version |
| Project metadata    | Name, description, type, stack, architecture      |
| Module map          | Define business modules and their folders         |
| Layer map           | Define architecture layers                        |
| Dependency rules    | Define allowed and forbidden dependencies         |
| API map             | Connect endpoints to modules                      |
| Database map        | Connect tables/entities to modules                |
| Test map            | Connect tests to modules/features                 |
| Risk rules          | Mark sensitive files and modules                  |
| AI rules            | Define instructions for AI tools                  |
| Ownership map       | Define maintainers or teams per module            |
| ADR support         | Link architecture decisions to modules            |
| Generated graph     | Store scanned output in standard JSON             |

### Example: `project.yml`

```yaml
protocol:
  name: RepoGraph
  version: 0.1.0

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
```

---

## Module 2: **CLI Application**

### Purpose

The CLI is the main developer entry point.

### CLI Name

```bash
repograph
```

### Required Commands

| Command               | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `repograph init`      | Create `.repograph` folder and starter config  |
| `repograph scan`      | Scan repository and generate graph             |
| `repograph explain`   | Explain project, module, file, or architecture |
| `repograph check`     | Validate architecture and rules                |
| `repograph impact`    | Show impact of changing a file/module          |
| `repograph prompt`    | Generate AI-ready task context                 |
| `repograph export`    | Export graph/context to different formats      |
| `repograph doctor`    | Check RepoGraph setup health                   |
| `repograph visualize` | Generate dependency diagrams                   |
| `repograph diff`      | Compare graph changes between branches         |
| `repograph validate`  | Validate `.repograph` config files             |
| `repograph list`      | List modules, layers, APIs, rules, risks       |
| `repograph sync`      | Update generated files from current code       |
| `repograph stats`     | Show repository complexity metrics             |

### Example Commands

```bash
repograph init
repograph scan
repograph explain
repograph explain module Auth
repograph explain file src/Application/Auth/LoginCommand.cs
repograph check
repograph impact src/Domain/Entities/Booking.cs
repograph prompt "Add booking cancellation feature"
repograph export --format cursor
repograph export --format claude
repograph export --format mcp
repograph visualize --format mermaid
```

---

## Module 3: **Repository Scanner Engine**

### Purpose

Scan the repository and extract structural information.

### Features

| Feature                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| File tree scanner      | Reads repository folders and files                       |
| Ignore rules           | Respects `.gitignore`, `.repographignore`                |
| Language detector      | Detects C#, TypeScript, JavaScript, Python, etc.         |
| Framework detector     | Detects ASP.NET Core, Angular, React, Node, Django, etc. |
| Config detector        | Reads project config files                               |
| Dependency detector    | Extracts imports/references                              |
| Project file scanner   | Reads `.csproj`, `package.json`, `tsconfig.json`, etc.   |
| Test detector          | Finds test projects and test files                       |
| API detector           | Finds controllers, routes, handlers, endpoints           |
| Database detector      | Finds entities, migrations, schemas                      |
| Documentation detector | Reads README, docs, ADRs                                 |
| CI detector            | Reads GitHub Actions, Azure pipelines, etc.              |

### Scanner Output

```json
{
  "files": [],
  "modules": [],
  "layers": [],
  "dependencies": [],
  "apis": [],
  "database": [],
  "tests": [],
  "risks": [],
  "violations": []
}
```

---

## Module 4: **Language Analyzer System**

### Purpose

Analyze code accurately per language.

### Supported Analyzer Structure

```txt
analyzers/
  csharp/
  typescript/
  javascript/
  python/
  java/
  go/
  php/
```

### Required Analyzer Features

| Feature               | Description                        |
| --------------------- | ---------------------------------- |
| Class extraction      | Find classes/interfaces/types      |
| Method extraction     | Find methods/functions             |
| Import extraction     | Find dependencies                  |
| Namespace extraction  | Detect namespaces/modules          |
| Annotation extraction | Detect attributes/decorators       |
| Route extraction      | Find API endpoints                 |
| Entity extraction     | Find database models               |
| Test extraction       | Find tests and test coverage links |
| Dependency direction  | Detect layer/module imports        |
| Symbol map            | Build symbol-level index           |

### First-Class Analyzer Targets

Since this project should match your strengths:

| Priority       | Stack                |
| -------------- | -------------------- |
| Strong support | C# / ASP.NET Core    |
| Strong support | Angular / TypeScript |
| Later support  | Node.js              |
| Later support  | Python               |
| Later support  | Java                 |

---

## Module 5: **Architecture Modeler**

### Purpose

Represent the intended architecture of the project.

### Features

| Feature                      | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| Layer definition             | Domain, Application, Infrastructure, Web, etc.       |
| Module definition            | Auth, Booking, Billing, Tenant, Notification, etc.   |
| Dependency direction rules   | Define what can depend on what                       |
| Boundary rules               | Prevent cross-module leakage                         |
| Critical path definition     | Mark sensitive flows                                 |
| Architecture style templates | Clean Architecture, Hexagonal, MVC, Modular Monolith |
| Custom architecture support  | Allow custom structures                              |
| Enforcement mode             | Warning/error/strict                                 |

### Example: `architecture.yml`

```yaml
architecture:
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
```

---

## Module 6: **Module Boundary Mapper**

### Purpose

Map business modules to files, APIs, database tables, tests, docs, and owners.

### Features

| Feature                  | Description                        |
| ------------------------ | ---------------------------------- |
| Module declaration       | Define modules manually            |
| Auto module detection    | Infer modules from folder names    |
| File-to-module mapping   | Link files to modules              |
| API-to-module mapping    | Link endpoints to modules          |
| Entity-to-module mapping | Link DB entities/tables            |
| Test-to-module mapping   | Link tests to modules              |
| Ownership mapping        | Define owner/team/maintainer       |
| Risk mapping             | Mark module risk level             |
| Module dependency graph  | Show module-to-module dependencies |
| Module health score      | Check docs/tests/rules coverage    |

### Example: `modules.yml`

```yaml
modules:
  Auth:
    description: Handles login, registration, tokens, and identity
    paths:
      - "src/Application/Auth/**"
      - "src/Web/Controllers/AuthController.cs"
    risk: critical
    owners:
      - security-team
    rules:
      - Never expose refresh tokens in API responses
      - Passwords must be hashed through approved services

  Booking:
    description: Handles vehicle booking lifecycle
    paths:
      - "src/Application/Bookings/**"
      - "src/Domain/Entities/Booking.cs"
    risk: high
```

---

## Module 7: **Dependency Graph Engine**

### Purpose

Build a graph of project dependencies.

### Graph Types

| Graph                     | Description                        |
| ------------------------- | ---------------------------------- |
| File dependency graph     | File imports/references            |
| Module dependency graph   | Module-to-module relationship      |
| Layer dependency graph    | Layer-to-layer dependency          |
| API dependency graph      | Endpoint to handler/service/entity |
| Database dependency graph | Entity/table relationships         |
| Test dependency graph     | Tests connected to production code |
| Ownership graph           | Files/modules to owners            |
| Risk graph                | Sensitive files and flows          |

### Features

| Feature                        | Description                             |
| ------------------------------ | --------------------------------------- |
| Directed graph generation      | Dependencies have direction             |
| Circular dependency detection  | Detect cycles                           |
| Forbidden dependency detection | Detect architecture breaks              |
| Orphan file detection          | Find files not mapped to modules        |
| Dead module detection          | Find modules with no active usage       |
| Dependency depth score         | Find overly deep chains                 |
| High coupling detection        | Find modules with too many dependencies |
| Graph export                   | JSON, Mermaid, DOT, Markdown            |

---

## Module 8: **Rule Engine**

### Purpose

Validate the repository against architecture, security, quality, and AI-safety rules.

### Rule Categories

| Category            | Example                                             |
| ------------------- | --------------------------------------------------- |
| Architecture rules  | Web cannot depend on Infrastructure                 |
| Module rules        | Booking cannot directly depend on Payment internals |
| Layer rules         | Domain cannot depend on EF Core                     |
| Naming rules        | Commands must end with `Command`                    |
| Test rules          | Critical modules must have tests                    |
| API rules           | Public endpoints must have DTOs                     |
| Database rules      | Tenant-scoped tables must include `TenantId`        |
| AI rules            | AI must not edit generated files                    |
| Risk rules          | Auth files require senior review                    |
| Documentation rules | Critical modules need ADRs                          |

### Rule Severity

```yaml
severity:
  - info
  - warning
  - error
  - critical
```

### Example: `rules.yml`

```yaml
rules:
  - id: domain-no-efcore
    type: forbidden_dependency
    source: Domain
    forbidden:
      - Microsoft.EntityFrameworkCore
    severity: critical

  - id: tenant-table-requires-tenant-id
    type: database_rule
    applies_to: tenant_scoped_entities
    require_property: TenantId
    severity: critical
```

---

## Module 9: **Impact Analysis Engine**

### Purpose

Show what will be affected when a file, module, API, or table changes.

### Features

| Feature           | Description                                 |
| ----------------- | ------------------------------------------- |
| File impact       | What depends on this file                   |
| Module impact     | Which modules may break                     |
| API impact        | Which clients/endpoints are affected        |
| Database impact   | Which entities/migrations are affected      |
| Test impact       | Which tests should run                      |
| Risk impact       | Whether the change touches critical files   |
| Owner impact      | Which maintainers should review             |
| AI context impact | Which files should be included in AI prompt |

### Example Command

```bash
repograph impact src/Domain/Entities/Booking.cs
```

### Example Output

```txt
Impact Analysis: Booking.cs

Module:
- Booking

Affected files:
- CancelBookingCommand.cs
- CreateBookingCommand.cs
- BookingRepository.cs
- BookingController.cs

Affected APIs:
- POST /api/bookings
- POST /api/bookings/{id}/cancel

Required tests:
- BookingTests
- BookingCancellationTests

Risk:
- High

Review required from:
- booking-maintainer
```

---

## Module 10: **AI Context Pack Generator**

### Purpose

Generate accurate, controlled context for AI coding tools.

### Supported Outputs

| Output                      | Purpose                      |
| --------------------------- | ---------------------------- |
| Markdown context            | General use                  |
| Cursor rules                | Cursor integration           |
| Claude context              | Claude Code usage            |
| GitHub Copilot instructions | Copilot workspace rules      |
| MCP format                  | AI tool protocol integration |
| JSON context                | Tool-readable format         |
| Prompt pack                 | Task-specific AI prompt      |

### Features

| Feature                       | Description                          |
| ----------------------------- | ------------------------------------ |
| Task-aware context generation | Context based on requested task      |
| Module-aware context          | Include relevant modules only        |
| Rule injection                | Include architecture rules           |
| Risk warnings                 | Warn AI about sensitive files        |
| File suggestions              | Tell AI which files to inspect/edit  |
| Forbidden edit list           | Protect generated/sensitive files    |
| Test instruction generation   | Tell AI which tests to create/update |
| Output style control          | Short/full/strict modes              |

### Example Command

```bash
repograph prompt "Add refund support to booking cancellation"
```

### Example Output

```txt
Task:
Add refund support to booking cancellation.

Relevant module:
- Booking
- Payment

Relevant files:
- Booking.cs
- BookingStatus.cs
- CancelBookingCommand.cs
- PaymentTransaction.cs
- BookingController.cs

Architecture rules:
- Controller must call MediatR command only
- Application must not depend on Infrastructure
- Domain must not depend on EF Core

Risk:
High. This touches booking and payment flow.

Required tests:
- Cancellation with refund
- Cancellation without refund
- Failed refund handling
```

---

## Module 11: **Documentation Intelligence Module**

### Purpose

Connect docs with actual code structure.

### Features

| Feature                 | Description                           |
| ----------------------- | ------------------------------------- |
| README parser           | Extract project summary               |
| ADR parser              | Read architecture decisions           |
| Module docs parser      | Link docs to modules                  |
| Outdated docs detection | Detect docs referencing deleted files |
| Missing docs detection  | Critical modules without docs         |
| Glossary builder        | Extract business terms                |
| Docs-to-code map        | Link documentation sections to files  |
| Code-to-docs map        | Show docs related to a file/module    |

### Example: `glossary.yml`

```yaml
terms:
  Tenant:
    meaning: A company or organization using the SaaS platform
    related_modules:
      - TenantManagement
      - Auth
      - Billing

  Booking:
    meaning: A customer reservation for a vehicle
    related_modules:
      - Booking
      - Payment
```

---

## Module 12: **API Mapper**

### Purpose

Map API endpoints to modules, handlers, DTOs, entities, and tests.

### Features

| Feature                     | Description                           |
| --------------------------- | ------------------------------------- |
| Controller route scanning   | Detect ASP.NET routes                 |
| Minimal API scanning        | Detect minimal APIs                   |
| Endpoint-to-module mapping  | Link routes to modules                |
| Endpoint-to-handler mapping | Link API to command/query             |
| Endpoint-to-DTO mapping     | Link request/response models          |
| Endpoint-to-entity mapping  | Link domain/database usage            |
| Endpoint risk scoring       | Mark auth/payment/admin APIs as risky |
| OpenAPI integration         | Import/export OpenAPI                 |
| Missing API docs check      | Detect undocumented endpoints         |

### Example Output

```txt
GET /api/bookings/{id}

Module:
- Booking

Flow:
BookingController
-> GetBookingByIdQuery
-> GetBookingByIdHandler
-> IBookingRepository
-> Booking entity

Risk:
Medium

Tests:
- GetBookingByIdTests
```

---

## Module 13: **Database Mapper**

### Purpose

Map database structure to code modules.

### Features

| Feature                  | Description                                   |
| ------------------------ | --------------------------------------------- |
| Entity scanner           | Detect domain/entities                        |
| DbContext scanner        | Detect EF Core mappings                       |
| Migration scanner        | Detect schema changes                         |
| Table-to-module mapping  | Link tables to modules                        |
| Relationship detection   | Detect FK-like relationships                  |
| Tenant isolation checker | Ensure tenant-scoped entities have `TenantId` |
| Soft delete checker      | Ensure required soft-delete fields            |
| Audit field checker      | Ensure CreatedAt/UpdatedAt/etc.               |
| Risk table detection     | Mark auth/payment/user data tables            |
| ERD export               | Generate Mermaid ER diagrams                  |

### Example: `database.yml`

```yaml
entities:
  Booking:
    table: Bookings
    module: Booking
    risk: high
    tenant_scoped: true
    required_fields:
      - TenantId
      - CreatedAt
      - UpdatedAt

  PaymentTransaction:
    table: PaymentTransactions
    module: Payment
    risk: critical
```

---

## Module 14: **Test Intelligence Module**

### Purpose

Connect tests to modules, files, APIs, and business flows.

### Features

| Feature                     | Description                          |
| --------------------------- | ------------------------------------ |
| Test file detection         | Find unit/integration/e2e tests      |
| Test-to-module mapping      | Link tests to modules                |
| Test-to-API mapping         | Link tests to endpoints              |
| Missing test detection      | Critical files without tests         |
| Suggested tests             | Recommend tests for impacted changes |
| Risk-based test requirement | High-risk module needs tests         |
| CI test command suggestion  | Suggest commands to run              |
| Coverage integration        | Optional coverage report import      |

### Example Output

```txt
Module: Auth

Production files:
- 18

Tests found:
- 6

Missing coverage areas:
- Refresh token rotation
- Failed login lockout
- Password reset expiry

Risk:
Critical
```

---

## Module 15: **Risk Engine**

### Purpose

Identify risky files, modules, APIs, and changes.

### Risk Categories

| Category         | Examples                                 |
| ---------------- | ---------------------------------------- |
| Security         | Auth, permissions, tokens                |
| Data privacy     | User profile, KYC, personal data         |
| Payment          | Billing, invoice, refund                 |
| Tenant isolation | TenantId filtering                       |
| Infrastructure   | CI/CD, deployment scripts                |
| Database         | Migrations, schema changes               |
| Generated code   | Files that should not be manually edited |
| Public API       | Breaking contract risk                   |

### Features

| Feature              | Description                      |
| -------------------- | -------------------------------- |
| Risk labels          | Low/medium/high/critical         |
| Sensitive path rules | Mark paths as sensitive          |
| Risk scoring         | Calculate score for changes      |
| PR risk summary      | Generate review risk report      |
| Reviewer suggestion  | Suggest owners for risky modules |
| AI safety warning    | Warn AI tools before risky edits |

### Example: `risk.yml`

```yaml
sensitive_paths:
  - path: "src/Application/Auth/**"
    risk: critical
    reason: Authentication flow

  - path: "src/Infrastructure/Persistence/Migrations/**"
    risk: high
    reason: Database schema changes

  - path: ".github/workflows/**"
    risk: high
    reason: CI/CD execution path
```

---

## Module 16: **Ownership and Maintainer Module**

### Purpose

Define who owns what.

### Features

| Feature            | Description                        |
| ------------------ | ---------------------------------- |
| Module ownership   | Assign teams/users to modules      |
| File ownership     | Assign owners to paths             |
| Review suggestions | Suggest reviewers for changes      |
| CODEOWNERS import  | Read GitHub CODEOWNERS             |
| CODEOWNERS export  | Generate CODEOWNERS from RepoGraph |
| Ownership gaps     | Detect unowned critical modules    |

### Example: `ownership.yml`

```yaml
owners:
  auth-team:
    members:
      - "@baasith"
    modules:
      - Auth

  platform-team:
    members:
      - "@platform-maintainer"
    modules:
      - TenantManagement
      - Billing
```

---

## Module 17: **Visualization Module**

### Purpose

Generate diagrams from the repository graph.

### Supported Diagrams

| Diagram           | Description                     |
| ----------------- | ------------------------------- |
| Module graph      | Business module dependencies    |
| Layer graph       | Architecture layers             |
| File graph        | File-level dependencies         |
| API flow graph    | Endpoint to handler to database |
| Database ERD      | Entity/table relationships      |
| Risk map          | Sensitive areas                 |
| Ownership map     | Owners and modules              |
| Test coverage map | Modules to tests                |

### Export Formats

```txt
- Mermaid
- Graphviz DOT
- SVG
- PNG
- Markdown
- JSON
```

### Example Command

```bash
repograph visualize --type module --format mermaid
```

---

## Module 18: **CI/CD Integration Module**

### Purpose

Run RepoGraph checks automatically in pipelines.

### Required Integrations

| Integration            | Purpose                    |
| ---------------------- | -------------------------- |
| GitHub Actions         | Main open-source CI target |
| Azure DevOps Pipelines | Enterprise/.NET teams      |
| GitLab CI              | Open-source and enterprise |
| Jenkins                | Legacy enterprise          |

### GitHub Action Features

| Feature                 | Description                      |
| ----------------------- | -------------------------------- |
| Run architecture checks | Fail build on violations         |
| Comment PR summary      | Add RepoGraph report             |
| Detect risky changes    | Label PR risk level              |
| Suggest reviewers       | Based on ownership               |
| Show impacted modules   | Help reviewers understand change |
| Export graph artifact   | Store generated graph            |
| Compare graph diff      | Detect architecture drift        |

### Example GitHub Action

```yaml
name: RepoGraph Check

on:
  pull_request:
    branches:
      - main

jobs:
  repograph:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run RepoGraph
        uses: repograph/repograph-action@v1
        with:
          config: ".repograph/project.yml"
          fail-on: "critical"
```

---

## Module 19: **IDE / Editor Integration Module**

### Purpose

Bring RepoGraph context into developer editors.

### Required IDE Targets

| IDE             | Reason                     |
| --------------- | -------------------------- |
| VS Code         | Largest developer adoption |
| JetBrains Rider | Strong .NET usage          |
| Visual Studio   | Enterprise .NET users      |
| Cursor          | AI-assisted development    |
| Windsurf        | AI-assisted development    |

### Features

| Feature              | Description                          |
| -------------------- | ------------------------------------ |
| Module sidebar       | Show current file’s module           |
| Architecture warning | Warn on dependency violation         |
| File explanation     | Explain selected file                |
| Impact preview       | Show affected files before editing   |
| AI prompt export     | Generate prompt from current context |
| Risk indicator       | Show risk level of current file      |
| Owner info           | Show responsible maintainer          |
| Diagram preview      | Show module/layer graph              |
| Rule hints           | Show relevant architecture rules     |

---

## Module 20: **AI Tool Exporters**

### Purpose

Make RepoGraph usable by existing AI tools.

### Export Targets

| Target                | Output                            |
| --------------------- | --------------------------------- |
| Cursor                | `.cursor/rules`                   |
| Claude Code           | `CLAUDE.md` / context markdown    |
| GitHub Copilot        | `.github/copilot-instructions.md` |
| MCP                   | Machine-readable context server   |
| Generic LLM           | Markdown prompt pack              |
| JSON API              | Tool-readable graph               |
| OpenAPI-style context | Structured external integration   |

### Features

| Feature                       | Description                   |
| ----------------------------- | ----------------------------- |
| Generate Cursor rules         | Repo-specific AI instructions |
| Generate Copilot instructions | Workspace coding rules        |
| Generate Claude context       | Project map and edit rules    |
| Generate MCP endpoint         | Serve graph to AI tools       |
| Export minimal context        | For small prompts             |
| Export full context           | For deep work                 |
| Export task-specific context  | Based on task description     |

---

## Module 21: **MCP / Context Server Module**

### Purpose

Expose RepoGraph as a local context server for AI tools.

### Features

| Feature              | Description                              |
| -------------------- | ---------------------------------------- |
| Local server         | Run `repograph serve`                    |
| Query project graph  | AI tools can ask for modules/files/rules |
| Get relevant context | Return context for a task                |
| Impact query         | Return affected files                    |
| Rule query           | Return applicable architecture rules     |
| Risk query           | Return sensitive files                   |
| File explanation     | Return explanation of a file             |
| Module explanation   | Return explanation of a module           |

### Example Commands

```bash
repograph serve
repograph serve --port 4317
```

### Example AI Query

```json
{
  "task": "Add booking cancellation",
  "module": "Booking"
}
```

### Example Response

```json
{
  "relevant_files": [],
  "rules": [],
  "risks": [],
  "tests": [],
  "suggested_steps": []
}
```

---

## Module 22: **Graph Storage Module**

### Purpose

Store generated graph data locally.

### Storage Options

| Storage         | Use                          |
| --------------- | ---------------------------- |
| JSON            | Default generated graph      |
| SQLite          | Local queryable graph        |
| PostgreSQL      | Optional hosted/team version |
| In-memory graph | Fast CLI operations          |

### Required Generated Files

```txt
.repograph/generated/
  graph.json
  graph.sqlite
  modules.json
  dependencies.json
  risks.json
  violations.json
  context-pack.md
```

### Features

| Feature             | Description                    |
| ------------------- | ------------------------------ |
| Graph persistence   | Save scan output               |
| Incremental updates | Avoid full rescan every time   |
| Branch comparison   | Compare graph states           |
| Query API           | Internal graph query engine    |
| Export system       | Convert graph to other formats |

---

## Module 23: **Graph Query Engine**

### Purpose

Allow tools and commands to query the repository graph.

### Query Examples

```bash
repograph query "module:Auth"
repograph query "risk:critical"
repograph query "depends_on:Infrastructure"
repograph query "owner:auth-team"
```

### Features

| Feature             | Description           |
| ------------------- | --------------------- |
| Query by module     | Find module files     |
| Query by layer      | Find layer files      |
| Query by risk       | Find sensitive files  |
| Query by owner      | Find owned files      |
| Query by dependency | Find dependency paths |
| Query by API        | Find endpoint flow    |
| Query by entity     | Find database usage   |
| Query by violation  | Find broken rules     |

---

## Module 24: **Configuration Validation Module**

### Purpose

Ensure `.repograph` files are valid.

### Features

| Feature                   | Description                               |
| ------------------------- | ----------------------------------------- |
| YAML schema validation    | Validate all config files                 |
| Missing file detection    | Detect missing required files             |
| Invalid path detection    | Detect broken path references             |
| Invalid owner detection   | Detect unknown owners                     |
| Invalid module references | Detect references to non-existing modules |
| Rule syntax validation    | Validate rule definitions                 |
| Auto-fix suggestions      | Suggest corrections                       |
| Strict mode               | Fail on warnings                          |

### Example Command

```bash
repograph validate
```

---

## Module 25: **Template System**

### Purpose

Help users initialize RepoGraph quickly.

### Templates Needed

| Template              | Target                   |
| --------------------- | ------------------------ |
| Clean Architecture C# | ASP.NET Core projects    |
| Modular Monolith C#   | Enterprise backend       |
| Angular frontend      | Angular apps             |
| React frontend        | React apps               |
| Node API              | Express/NestJS           |
| Python API            | FastAPI/Django           |
| Java Spring Boot      | Enterprise Java          |
| Open-source library   | Package/library projects |
| SaaS multi-tenant     | Tenant-based apps        |
| Monorepo              | Multiple apps/packages   |

### Example Command

```bash
repograph init --template clean-architecture-dotnet
repograph init --template angular
repograph init --template multi-tenant-saas
```

---

## Module 26: **Plugin System**

### Purpose

Allow the community to add support for new languages, frameworks, and rules.

### Plugin Types

| Plugin Type        | Purpose                         |
| ------------------ | ------------------------------- |
| Language analyzer  | Add language support            |
| Framework analyzer | Add framework-specific scanning |
| Rule plugin        | Add custom rules                |
| Exporter plugin    | Add new output format           |
| Visualizer plugin  | Add diagram type                |
| Storage plugin     | Add new storage backend         |

### Plugin Requirements

```txt
- Plugin manifest
- Version compatibility
- Input/output contract
- Sandbox execution rules
- Error isolation
```

### Example Plugin Manifest

```yaml
plugin:
  name: repograph-analyzer-python
  type: language-analyzer
  language: python
  version: 0.1.0
```

---

## Module 27: **Dashboard / Web UI**

### Purpose

Give teams a visual interface for RepoGraph.

### Dashboard Features

| Feature              | Description                       |
| -------------------- | --------------------------------- |
| Project overview     | Modules, layers, risk, violations |
| Module explorer      | Browse modules and dependencies   |
| File explorer        | Understand file relationships     |
| Architecture view    | Visual layer/module graph         |
| API map              | View endpoints and flows          |
| Database map         | View entities and relationships   |
| Risk center          | View sensitive files/modules      |
| Violation center     | View rule violations              |
| AI context builder   | Generate context from UI          |
| Ownership view       | See maintainers and teams         |
| Graph diff view      | Compare branches/commits          |
| Documentation health | Find missing/outdated docs        |

### Important

Dashboard is useful, but not the core product. The protocol and CLI matter more.

---

## Module 28: **Cloud / Team Server**

### Purpose

Optional hosted/team version for organizations.

### Features

| Feature                   | Description                      |
| ------------------------- | -------------------------------- |
| Organization dashboard    | Manage multiple repos            |
| Team access control       | Admin/member/viewer roles        |
| Historical graph tracking | Track architecture drift         |
| PR graph diff history     | See structural changes over time |
| Cross-repo dependency map | Understand multi-repo systems    |
| Policy management         | Shared architecture rules        |
| API access                | Query RepoGraph remotely         |
| Audit logs                | Track changes and scans          |

### Warning

Do not make the open-source project cloud-dependent. That will reduce trust.

---

## Module 29: **Open-Source Community Module**

### Purpose

Make RepoGraph adoptable and contributable.

### Required Community Assets

```txt
README.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
ROADMAP.md
GOVERNANCE.md
LICENSE
docs/
examples/
templates/
```

### Features

| Feature                 | Description                    |
| ----------------------- | ------------------------------ |
| Example repositories    | Show real use cases            |
| Starter templates       | Fast setup                     |
| Rule library            | Reusable rules                 |
| Language support matrix | Show supported stacks          |
| Contribution guide      | Explain plugin development     |
| Public RFC process      | Accept protocol changes        |
| Governance model        | Prevent chaos as project grows |

---

# 9. Full Feature List

## 9.1 Protocol Features

```txt
- .repograph folder standard
- Project metadata schema
- Module schema
- Layer schema
- Dependency schema
- Rule schema
- API schema
- Database schema
- Test schema
- Risk schema
- Ownership schema
- AI instruction schema
- Glossary schema
- ADR linking
- Generated graph schema
- Protocol versioning
- Schema validation
```

---

## 9.2 CLI Features

```txt
- Initialize RepoGraph
- Scan repository
- Explain project
- Explain module
- Explain file
- Validate configuration
- Check architecture violations
- Generate graph
- Generate diagrams
- Generate AI context
- Generate task prompt
- Export graph
- Compare graph diff
- Show impacted files
- Show risky files
- Show orphan files
- Show module ownership
- Show dependency cycles
- Show missing tests
- Show missing docs
- Run diagnostics
```

---

## 9.3 Scanner Features

```txt
- File tree scanning
- Git ignore support
- RepoGraph ignore support
- Language detection
- Framework detection
- Project config parsing
- Import/reference extraction
- Class/interface extraction
- API route extraction
- Entity/model extraction
- Migration scanning
- Test scanning
- Documentation scanning
- CI workflow scanning
- Ownership scanning
```

---

## 9.4 Analysis Features

```txt
- Layer dependency validation
- Module boundary validation
- Circular dependency detection
- Forbidden dependency detection
- Risk scoring
- API flow mapping
- Database relationship mapping
- Test relationship mapping
- Documentation coverage checking
- Architecture drift detection
- Orphan file detection
- High-coupling detection
- Missing ownership detection
```

---

## 9.5 AI Features

```txt
- Generate project context
- Generate module context
- Generate file context
- Generate task-specific context
- Generate Cursor rules
- Generate Claude context
- Generate Copilot instructions
- Generate MCP-compatible graph
- Warn AI about risky files
- Suggest files to edit
- Suggest tests to update
- Include architecture rules in prompts
- Exclude irrelevant files from context
```

---

## 9.6 Visualization Features

```txt
- Module dependency diagram
- Layer dependency diagram
- File dependency diagram
- API flow diagram
- Database ERD
- Test coverage map
- Ownership map
- Risk heatmap
- Architecture violation map
- Branch diff graph
```

---

## 9.7 CI Features

```txt
- GitHub Action
- Azure DevOps task
- GitLab CI template
- PR comment summary
- PR risk report
- Architecture check
- Rule violation check
- Graph diff check
- Fail build on severity threshold
- Export graph artifact
- Suggest reviewers
```

---

# 10. System Architecture

## Recommended Architecture

```txt
repograph/
  apps/
    cli/
    dashboard/
    vscode-extension/
    mcp-server/

  packages/
    protocol/
    scanner-core/
    graph-core/
    rule-engine/
    analyzers/
      csharp/
      typescript/
      javascript/
      python/
    exporters/
      markdown/
      json/
      mermaid/
      cursor/
      claude/
      copilot/
      mcp/
    templates/
    shared/

  docs/
  examples/
  tests/
```

---

# 11. Recommended Tech Stack

## Best Stack for Open-Source Adoption

| Area              | Technology                                |
| ----------------- | ----------------------------------------- |
| CLI               | TypeScript / Node.js                      |
| Scanner core      | TypeScript                                |
| Graph engine      | TypeScript                                |
| Config format     | YAML + JSON Schema                        |
| Local storage     | JSON + SQLite                             |
| Dashboard         | Next.js or Angular                        |
| VS Code extension | TypeScript                                |
| GitHub Action     | TypeScript                                |
| MCP server        | TypeScript                                |
| C# analyzer       | Roslyn-based helper or parser integration |
| Diagrams          | Mermaid / Graphviz                        |

## Brutal Recommendation

Use **TypeScript for the core open-source ecosystem**.

Even though your .NET skill is strong, GitHub tooling, VS Code extensions, AI tooling, and open-source CLI adoption are easier with TypeScript.

But for C# deep analysis, build a separate analyzer package:

```txt
repograph-analyzer-csharp
```

That can use Roslyn later.

---

# 12. Data Model

## 12.1 Main Entities

```txt
Project
Module
Layer
FileNode
Symbol
Dependency
ApiEndpoint
DatabaseEntity
TestNode
Rule
Violation
RiskItem
Owner
DecisionRecord
ContextPack
```

---

## 12.2 Graph Node Types

```txt
PROJECT
MODULE
LAYER
FILE
CLASS
INTERFACE
METHOD
API_ENDPOINT
DATABASE_ENTITY
DATABASE_TABLE
TEST
DOCUMENT
OWNER
RULE
ADR
```

---

## 12.3 Graph Edge Types

```txt
BELONGS_TO
DEPENDS_ON
IMPLEMENTS
CALLS
EXPOSES
USES_ENTITY
TESTS
OWNED_BY
DOCUMENTED_BY
VIOLATES
PROTECTED_BY
RELATED_TO
```

---

# 13. Acceptance Criteria

## Protocol Acceptance

```txt
- A repository can define modules, layers, rules, risks, APIs, database entities, tests, and owners using .repograph files.
- All .repograph files can be validated.
- Invalid configs produce clear error messages.
```

## CLI Acceptance

```txt
- CLI can initialize a repository.
- CLI can scan a repository.
- CLI can generate graph.json.
- CLI can explain a module.
- CLI can explain a file.
- CLI can detect architecture violations.
- CLI can generate AI context.
- CLI can export Mermaid diagrams.
```

## Scanner Acceptance

```txt
- Scanner respects ignored files.
- Scanner detects languages.
- Scanner detects project structure.
- Scanner extracts dependencies.
- Scanner maps files to modules.
- Scanner identifies unmapped files.
```

## Rule Engine Acceptance

```txt
- Rule engine detects forbidden layer dependencies.
- Rule engine detects circular dependencies.
- Rule engine detects critical rule violations.
- Rule engine supports severity levels.
- Rule engine can fail CI based on severity.
```

## AI Context Acceptance

```txt
- AI context includes relevant files.
- AI context includes architecture rules.
- AI context includes risk warnings.
- AI context excludes irrelevant files.
- AI context can be exported as Markdown, Cursor rules, Claude context, and JSON.
```

---

# 14. Example User Journey

## Developer wants to understand a codebase

```bash
repograph scan
repograph explain
```

Output:

```txt
This project is a Clean Architecture modular monolith.

Main modules:
- Auth
- Booking
- Payment
- Tenant
- Notification

Critical modules:
- Auth
- Payment
- Tenant

Architecture:
Web -> Application -> Domain
Infrastructure -> Application + Domain
```

---

## Developer wants to make a change safely

```bash
repograph impact src/Application/Bookings/CancelBookingCommand.cs
```

Output:

```txt
Affected module:
- Booking

Possible affected modules:
- Payment
- Notification

Risk:
High

Required tests:
- Booking cancellation tests
- Refund tests
- Notification tests
```

---

## Developer wants AI help

```bash
repograph prompt "Add booking cancellation with refund"
```

Output:

```txt
Use these files:
- Booking.cs
- CancelBookingCommand.cs
- PaymentTransaction.cs
- BookingController.cs

Do not violate:
- Web must not access repositories directly
- Application must not depend on Infrastructure
- TenantId must be validated before cancellation

Add tests:
- Cancel booking success
- Cancel booking already cancelled
- Cancel booking with refund failure
```

---

# 15. Open-Source Positioning

## Bad Positioning

```txt
AI documentation generator
Code analyzer
Project scanner
Architecture checker
```

Too generic.

## Strong Positioning

```txt
RepoGraph is a machine-readable context protocol for software repositories.
It helps humans, AI tools, and CI systems understand codebase architecture safely.
```

## Best One-Liner

> RepoGraph turns a repository into a structured knowledge graph that AI tools, developers, and CI pipelines can understand.

---

# 16. Repository Name

Use:

```txt
repograph
```

GitHub organization:

```txt
github.com/repograph
```

Main repositories:

```txt
repograph/repograph
repograph/spec
repograph/templates
repograph/examples
repograph/vscode-extension
repograph/repograph-action
```

---

# 17. License

Recommended:

```txt
Apache-2.0
```

Reason:

* More enterprise-friendly than GPL.
* Better for ecosystem adoption.
* Allows commercial use.
* Provides patent protection.

MIT is simpler, but Apache-2.0 is stronger for this type of infrastructure project.

---

# 18. What Makes This Project Actually Valuable

RepoGraph becomes useful when it answers questions like:

```txt
What does this project do?
Which module owns this file?
Can this layer depend on that layer?
What breaks if I change this file?
Which tests should I run?
Which APIs use this entity?
Which database tables belong to this module?
Which files are risky for AI to edit?
Which architecture decision explains this design?
What context should I give to Cursor or Claude Code?
```

That is the product.

Not fancy UI.

Not AI hype.

Not a chatbot.

The core value is **trusted project context**.

---

# 19. Minimum Complete Product Scope

Even without phases, the project becomes complete only when these core pieces exist:

```txt
1. Protocol specification
2. CLI
3. Repository scanner
4. Graph builder
5. Rule engine
6. Module mapper
7. Architecture validator
8. Impact analyzer
9. AI context generator
10. Exporters
11. CI integration
12. Templates
13. Documentation
14. Plugin system
```

Everything else is expansion.

---

# 20. Final Product Definition

**RepoGraph Protocol** is an open-source repository intelligence standard that creates a structured graph of a codebase, including modules, layers, dependencies, APIs, database entities, tests, risks, ownership, and architecture rules.

It provides:

```txt
- A .repograph protocol
- A CLI
- A scanner engine
- A graph engine
- A rule engine
- An impact analyzer
- AI context generators
- CI integrations
- IDE integrations
- Visualization tools
- Templates and plugins
```

The strongest version of the project is not:

> “A tool that explains code.”

It is:

> **A standard context layer for the AI-native software development era.**
