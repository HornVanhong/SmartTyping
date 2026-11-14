# Master AI Coding Prompt — TypeMaster

Act as a senior product engineer, software architect, UI/UX engineer and QA lead. Build **TypeMaster**, a free bilingual English/Khmer typing practice and multiplayer game platform.

## Confirmed project decisions
- Product: TypeMaster
- Scope: full platform
- Audience: everyone
- Languages: English + Khmer
- Multiplayer: yes
- Frontend: Next.js + TypeScript
- Backend: Spring Boot + Java
- Database: PostgreSQL

## Required preparation
1. Inspect the existing repository and report its current state before changing anything.
2. Read `AGENTS.md`, `CLAUDE.md` and all project documentation.
3. If no repository exists, propose a clean monorepo structure:
   - `apps/web` — Next.js
   - `apps/api` — Spring Boot
   - `infra` — local development and deployment configuration
   - `docs` — product and technical documentation
4. Confirm compatible stable versions from the available environment/package manager rather than guessing.
5. Produce an implementation plan with milestones, dependencies and test strategy.

## Product requirements
Implement:
- Guest-first typing test with 15/30/60/120 second options.
- English and Khmer content and localization.
- Beginner, intermediate and advanced levels.
- Live timer, CPM, English WPM, accuracy, correct/incorrect character feedback and restart.
- Practice library and multiple typing game modes.
- Registration, login, logout, secure refresh and profile.
- Saved typing history, dashboard, trend charts and achievements.
- Daily/weekly/all-time leaderboards with documented eligibility.
- Multiplayer quick match and private rooms, ready state, countdown, live progress, finish results and reconnect.
- Admin passage management and moderation foundations.
- Responsive, accessible UI.

## Critical Khmer requirements
- Store text as UTF-8.
- Use a Khmer-capable font and verify actual rendering.
- Handle browser IME composition events correctly.
- Do not score intermediate composition text.
- Use Unicode-aware grapheme handling for cursor and character counting.
- Show CPM for Khmer. Do not invent a Khmer WPM formula; keep the metric clearly labelled until a validated convention is agreed.
- Add browser-level tests for Khmer input and backspace behavior.

## Architecture requirements
- Use Next.js App Router and typed API client.
- Use Spring Boot modular monolith with clear domain packages.
- Use PostgreSQL and Flyway migrations.
- Use Spring Security, secure token lifecycle and role-based authorization.
- Use WebSocket for multiplayer.
- Use Redis for distributed room coordination when horizontally scaling.
- Use Docker Compose for local PostgreSQL and optional Redis.
- Include structured logs, health checks and configuration profiles.

## Security requirements
- Never store raw passwords or refresh tokens.
- Keep secrets out of source control and browser bundles.
- Validate every request and enforce object ownership.
- Rate-limit authentication, room creation/join and WebSocket messages.
- Do not trust client-submitted WPM, accuracy, progress or placement.
- Server must calculate or validate final multiplayer results.
- Protect WebSocket destinations and validate origins.
- Do not expose stack traces or sensitive data.
- Avoid storing raw typed input by default.

## Implementation sequence
### Milestone 1: Foundation
Create frontend/backend apps, linting, formatting, tests, health endpoint, PostgreSQL, Flyway and local setup docs.

### Milestone 2: Typing vertical slice
Build guest flow end-to-end: choose language and duration, fetch passage, type, calculate metrics, show result and restart. Complete Khmer IME handling before expanding.

### Milestone 3: Accounts and persistence
Add registration/login/refresh/logout, profiles, result submission and personal history. Add authorization tests.

### Milestone 4: Practice and analytics
Add content catalog, practice modes, dashboard, trends and achievements.

### Milestone 5: Leaderboards
Add server-side ranking eligibility, tie-break rules, pagination and abuse controls.

### Milestone 6: Multiplayer
Add room lifecycle, WebSocket events, server countdown, progress validation, server-side finish, reconnect and Redis coordination.

### Milestone 7: Admin and production readiness
Add passage administration, reports, audit logs, monitoring, backups, security review and deployment docs.

## UI direction
Use a polished dark-first visual system, restrained accent colors, strong typography and a minimal typing workspace. Keep the passage as the main focus. Use accessible states and responsive layouts. Use proper Khmer typography and do not simply force a Latin monospace font onto Khmer text.

## Quality gates
- TypeScript strict mode and no unexplained `any`.
- Backend validation and consistent errors.
- Unit, integration and browser tests.
- Formula tests and Unicode/IME tests.
- Ownership and role authorization tests.
- Multiplayer lifecycle and reconnect tests.
- Accessibility checks and responsive review.
- Build, lint and typecheck must pass.
- Update OpenAPI, migrations and documentation with changes.

## Working rules
- Do not implement the entire platform in one enormous code change.
- Work milestone by milestone and keep each milestone runnable.
- Do not generate fake data as if it were production data.
- Do not leave nonfunctional buttons or placeholder API integrations.
- Do not silently skip Khmer behavior.
- Do not claim tests passed unless executed.
- If an external service is unavailable, isolate it behind configuration and document the blocker.
- At the end of each milestone, report changed files, commands run, test results, known issues and the next milestone.

Start by inspecting the repository. Then implement Milestone 1 and the guest typing vertical slice as the first usable product increment. Do not begin multiplayer until the core typing engine, Unicode handling and result calculation are tested.
