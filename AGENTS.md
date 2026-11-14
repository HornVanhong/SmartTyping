# AGENTS.md — TypeMaster

## Mission
Build TypeMaster, a free bilingual English/Khmer typing practice and multiplayer game platform using Next.js, Spring Boot and PostgreSQL.

## Read first
Before changing code, inspect the repository structure, package manifests, existing conventions, tests and current git diff. Read the relevant PRD, SRS, architecture, schema and API documents in this directory.

## Non-negotiable product rules
1. Core typing practice and multiplayer remain free.
2. Guest users can complete a typing test without registering.
3. English and Khmer are first-class supported locales.
4. Khmer typing uses Unicode-safe input and IME composition handling.
5. Do not label Khmer CPM as WPM. WPM is shown only where its calculation is meaningful and documented.
6. Multiplayer room state and final results are server-authoritative.
7. Never trust client-submitted scores for ranked results.
8. Do not store raw typed text unless a feature explicitly requires it and privacy requirements are reviewed.

## General engineering rules
- Prefer small, reviewable changes and preserve existing architecture.
- Do not rewrite working modules without a clear reason.
- Use TypeScript strict mode and avoid `any`; explain unavoidable exceptions.
- Use DTOs and Bean Validation at API boundaries.
- Keep controllers thin; business logic belongs in services/domain modules.
- Use Flyway migrations for database changes.
- Never commit secrets, credentials, tokens or `.env` files.
- Do not add dependencies without explaining why they are needed.
- Do not leave TODOs, placeholder success responses or fake integrations in production paths.
- Do not claim a test/build passed unless you ran it and observed success.
- Update documentation and tests when behavior or contracts change.

## Frontend rules
- Use Next.js App Router and server components by default; use client components only for interaction.
- Keep the typing engine client-side and avoid network requests per keystroke.
- Handle `compositionstart`, `compositionupdate` and `compositionend`; do not score uncommitted IME composition text.
- Use Unicode-aware character handling; do not assume UTF-16 indexes equal grapheme indexes.
- Keep locale dictionaries typed and complete for `en` and `km`.
- Use accessible semantic HTML, visible focus and reduced-motion support.
- Do not hard-code colors; use design tokens.
- Test Khmer font rendering and responsive layouts.

## Backend rules
- Use Spring Security and role-based authorization.
- Hash passwords; hash refresh tokens at rest.
- Use transaction boundaries for race completion and other multi-row state changes.
- Validate all inputs and enforce ownership checks.
- Apply rate limits to auth, room creation/join and WebSocket progress.
- Use UTC timestamps.
- Return consistent error DTOs; never expose stack traces or SQL details.
- Add audit logs for privileged actions.

## Multiplayer rules
- Server controls room lifecycle, countdown, start time, finish and placement.
- Validate membership, room state, passage bounds, monotonic progress and message frequency.
- Reconnect must re-authorize the participant.
- Use Redis or another shared coordinator before running multiple API instances.
- Never broadcast private account data or raw auth tokens.

## Testing expectations
- Add unit tests for formulas, Unicode and state transitions.
- Add API integration tests for authorization and ownership.
- Add WebSocket tests for room lifecycle, invalid messages and reconnect.
- Test English and Khmer input on supported browsers.
- Run lint, typecheck, unit tests and relevant integration tests before finishing.
- Report exact commands and outcomes.

## Completion report
Summarize changed files, behavior, migrations, tests run and results, known limitations and next recommended task.
