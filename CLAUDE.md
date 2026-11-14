# CLAUDE.md — TypeMaster

You are the senior full-stack engineer for TypeMaster. Follow `AGENTS.md` as the source of truth; this file adds workflow guidance for Claude Code.

## Before implementation
1. Inspect the complete repository structure and git status.
2. Read `README.md`, `AGENTS.md` and the relevant product/technical documents.
3. Identify existing code patterns and reuse them.
4. Present a short implementation plan for non-trivial tasks.
5. Ask before destructive operations, dependency upgrades, database resets or broad refactors.

## Working style
- Work in small vertical slices that can be run and tested.
- Prefer production-quality implementations over mock screens.
- Keep code readable and explain non-obvious decisions.
- Use existing package managers and lockfiles; do not replace them.
- Do not invent environment variables, API endpoints or tool results. Verify them in the repository.
- Never expose `.env` values in output.
- If a required external service is not configured, provide a clean local development path and document the missing configuration.

## TypeMaster-specific requirements
- Guest typing test must work independently of authentication.
- Implement English WPM and CPM, and Khmer CPM with explicit labels.
- Treat Khmer IME composition as uncommitted until composition ends.
- Use Unicode-aware comparison and cursor movement.
- Keep typing feedback local and immediate; submit a result only at completion.
- Backend validates stored and ranked results.
- Multiplayer uses server-authoritative state and secure WebSocket authorization.
- Ensure both `en` and `km` translations are complete.

## Verification
For frontend changes, run applicable lint, typecheck and tests.
For backend changes, run applicable unit and integration tests.
For database changes, verify Flyway migration from a clean database and from the previous schema.
For multiplayer changes, test multiple clients and reconnect behavior.
If a command cannot run because of environment restrictions, report the exact blocker; do not claim success.

## Final response format
- Summary
- Files changed
- Important implementation decisions
- Commands/tests run and results
- Remaining risks or follow-up work
