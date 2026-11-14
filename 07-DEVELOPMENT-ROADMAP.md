# TypeMaster — Development Roadmap

## Delivery strategy
Build a working vertical slice first: select passage → type → calculate result → save result. Then add accounts, analytics, games and multiplayer. Do not start with multiplayer infrastructure before the typing engine is stable.

## Phase 0 — Project foundation (3–5 days)
- Create repository and branch strategy.
- Set up Next.js TypeScript app and Spring Boot service.
- Add PostgreSQL and Flyway.
- Configure environment variables and secret handling.
- Add lint, formatting, unit tests and CI.
- Add Docker Compose for local PostgreSQL and optional Redis.
**Exit:** both apps start locally; migration and health checks pass.

## Phase 1 — Typing engine MVP (1–2 weeks)
- Build passage selection and test configuration.
- Implement input capture and IME-safe composition handling.
- Implement timer, cursor, correct/incorrect states and restart.
- Implement CPM, English WPM and accuracy.
- Add English and Khmer starter content.
- Add responsive and keyboard-accessible UI.
**Exit:** guest can complete all supported test durations in both languages on target browsers.

## Phase 2 — Backend persistence and accounts (1–2 weeks)
- Build auth and profile modules.
- Add passage catalog endpoints.
- Add result submission and server validation.
- Add history and account settings.
- Add integration tests and authorization tests.
**Exit:** authenticated users can save and review their results; guest mode still works.

## Phase 3 — Dashboard, games and achievements (1–2 weeks)
- Add personal summary and trend endpoints.
- Build dashboard.
- Add practice categories and game modes.
- Add achievement criteria and award processing.
**Exit:** users can see meaningful progress and complete at least three distinct game modes.

## Phase 4 — Leaderboards (4–7 days)
- Define score eligibility and tie-breaking.
- Add time-window and locale filters.
- Add rate limits and suspicious-score checks.
- Build leaderboard UI.
**Exit:** ranking results are deterministic and only eligible records appear.

## Phase 5 — Multiplayer (2–3 weeks)
- Implement room create/join/ready lifecycle.
- Implement WebSocket authentication and authorization.
- Add server countdown and race state.
- Add progress broadcast and server-side result calculation.
- Add reconnect, disconnect and room expiry behavior.
- Add Redis coordination before deploying multiple backend instances.
**Exit:** automated tests cover two or more participants, disconnect/reconnect, invalid messages and race completion.

## Phase 6 — Admin, hardening and release (1–2 weeks)
- Build passage management and moderation.
- Add audit logging.
- Run accessibility, security and load tests.
- Configure monitoring, alerts, backups and restore test.
- Publish privacy policy, terms and content licensing information.
- Deploy staging, run acceptance tests, then production.
**Exit:** release checklist signed off and rollback procedure tested.

## Suggested team responsibilities
- Frontend: typing engine, pages, localization, accessibility and realtime UI.
- Backend: domain modules, auth, REST, WebSocket and persistence.
- QA: test plans, cross-browser Khmer input, load and security tests.
- Product/content: passage quality, language review, achievement rules and moderation policy.

## Definition of done
- Requirement and acceptance criteria met.
- Unit and integration tests pass.
- No critical/high security issue remains.
- Responsive and accessibility checks pass.
- English and Khmer content reviewed.
- API docs and migrations updated.
- Logs contain no secrets or typed private content.
- Feature flags and rollback plan exist for risky releases.
