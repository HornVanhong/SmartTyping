# TypeMaster — Software Requirements Specification (SRS)

## 1. Purpose and scope
This SRS defines observable system behavior for TypeMaster. It covers the Next.js web client, Spring Boot API, PostgreSQL persistence and WebSocket multiplayer service.

## 2. System context
- Browser client communicates with REST endpoints over HTTPS.
- Authenticated requests use secure access/refresh token handling.
- Multiplayer uses WebSocket over TLS; server owns room state and final result.
- PostgreSQL stores users, text passages, test sessions, results, rooms and achievements.
- Redis is recommended for distributed room coordination, rate limits and ephemeral presence.

## 3. User roles
- Guest: play tests and games; local results only.
- Member: all guest capabilities plus saved history, profile, rankings and multiplayer.
- Moderator: review reports and moderate permitted user content.
- Administrator: manage content, accounts, roles and system configuration.

## 4. Functional requirements

### FR-001 Browse and start
The system shall allow a guest to select a language, test duration, difficulty and mode and start without registering.
**Acceptance:** a guest can complete a test and see a result without any account API call.

### FR-002 Input correctness
The system shall process committed text input and correctly handle Unicode and IME composition.
**Acceptance:** Khmer composition is not scored until committed; composed characters are neither duplicated nor lost.

### FR-003 Metrics
The system shall calculate and label CPM, English WPM, accuracy, errors and elapsed time.
**Acceptance:** identical input and elapsed time produce deterministic metrics; zero-duration division is guarded.

### FR-004 Results
The system shall show a result summary and permit restart or a new test.
**Acceptance:** final result is immutable after completion and duplicate submissions are rejected or idempotently handled.

### FR-005 Authentication
The system shall support registration, login, token refresh and logout.
**Acceptance:** invalid credentials do not reveal whether an email exists; refresh tokens can be revoked.

### FR-006 History
Authenticated users shall list, filter, paginate and delete their own test history.
**Acceptance:** user A cannot read or delete user B's sessions.

### FR-007 Content
The system shall serve passages filtered by language, difficulty, mode and active status.
**Acceptance:** inactive or unpublished passages are never returned to normal users.

### FR-008 Dashboard
The system shall provide personal summaries, best records and historical trends.
**Acceptance:** all aggregates are scoped to the authenticated user and requested filters.

### FR-009 Leaderboard
The system shall expose rankings by time range, language and mode.
**Acceptance:** leaderboard queries use a documented score rule, stable tie-breakers and pagination.

### FR-010 Multiplayer room
Members shall create or join public/private rooms and receive room state events.
**Acceptance:** invalid room codes and full/started rooms return clear errors.

### FR-011 Multiplayer race
The server shall control countdown, race start, participant state and final placement.
**Acceptance:** a client cannot submit an arbitrary final WPM or claim completion without server validation.

### FR-012 Reconnect
A participant shall be able to reconnect to an active room.
**Acceptance:** server returns current room state and participant state after authorization.

### FR-013 Administration
Administrators shall create, edit, publish and archive passages and moderate reports.
**Acceptance:** every privileged operation checks role on the server and records an audit event.

### FR-014 Accessibility
The system shall support keyboard navigation, visible focus, semantic labels and reduced motion.
**Acceptance:** primary flows are operable without a mouse.

## 5. Non-functional requirements
- Performance: target LCP under 2.5s at the 75th percentile on representative mobile; typing keystroke feedback should feel immediate (target under 50ms client-side).
- API: target p95 under 500ms for ordinary reads under expected launch load; define load test profile before release.
- Availability: establish an initial target of 99.5% monthly after production monitoring is operational.
- Security: OWASP ASVS-informed controls; TLS; password hashing with Argon2id or BCrypt; least privilege; secrets outside source control.
- Privacy: data minimization, account deletion workflow, retention policy and privacy notice.
- Compatibility: current and previous major versions of Chrome, Edge, Firefox and Safari; test mobile Safari and Android Chrome.
- Scalability: API instances stateless; room state designed for Redis-backed coordination when horizontally scaled.
- Maintainability: linting, formatting, typed contracts, migrations, CI and documented runbooks.
- Localization: locale-aware UI, UTF-8 storage and font fallback with Khmer coverage.

## 6. Data validation
- Email normalized and unique.
- Password policy configurable; never log credentials or tokens.
- Display name length and character policy enforced server-side.
- Passage content length bounded.
- Duration restricted to supported values.
- Client metrics are advisory only for ranked/multiplayer records.
- Pagination limits enforced.
- All IDs are opaque UUIDs.

## 7. Error handling
Use a consistent error response:
```json
{
  "type": "https://typemaster.example/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/tests",
  "code": "VALIDATION_ERROR",
  "traceId": "opaque-id",
  "fieldErrors": [{"field": "durationSeconds", "message": "Unsupported duration"}]
}
```
Do not return stack traces, SQL details, token values or internal hostnames.

## 8. Acceptance test groups
- Guest test happy path and restart.
- English WPM and CPM formula unit tests.
- Khmer IME composition and Unicode normalization tests.
- Account registration/login/refresh/logout.
- Authorization and cross-user data isolation.
- Passage filtering and admin authorization.
- Leaderboard ordering and tie-breakers.
- Multiplayer room lifecycle, disconnect/reconnect and race completion.
- Rate-limit and invalid-message tests.
- Keyboard-only, contrast, screen-reader and responsive checks.
