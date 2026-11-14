# TypeMaster — Project Documentation

A free, bilingual (English + Khmer) typing practice and multiplayer typing game platform.

## Product decisions
- Name: TypeMaster
- Scope: Full platform
- Audience: Everyone
- Languages: English and Khmer
- Multiplayer: Yes
- Stack: Next.js + Spring Boot + PostgreSQL

## Recommended implementation baseline
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Java 21 LTS, Spring Boot 3.x, Spring Security, Spring Data JPA
- Database: PostgreSQL 16+
- Realtime: Spring WebSocket using STOMP or native WebSocket messaging
- Cache / room coordination: Redis (recommended for production multiplayer; optional for local MVP)
- Authentication: short-lived access JWT + rotating refresh token in HttpOnly Secure cookies
- Testing: Vitest/React Testing Library, JUnit 5, Testcontainers, Playwright
- Deployment: Vercel for frontend; AWS for API, PostgreSQL, Redis and object storage

## Document index
1. `01-PRD.md` — Product requirements
2. `02-SRS.md` — Software requirements and acceptance criteria
3. `03-ARCHITECTURE.md` — System architecture and deployment
4. `04-DATABASE-SCHEMA.md` — PostgreSQL data model and SQL
5. `05-API-SPECIFICATION.md` — REST and WebSocket contracts
6. `06-UI-UX-GUIDELINES.md` — Design system and screen behavior
7. `07-DEVELOPMENT-ROADMAP.md` — Milestones, priorities and QA
8. `AGENTS.md` — Repository-wide AI coding instructions
9. `CLAUDE.md` — Claude Code project instructions
10. `IMPLEMENTATION-PROMPT.md` — Master prompt for Codex / Claude Code

## Important product and engineering decisions
- Typing tests must work without an account. Accounts are only needed to sync history, join ranked competitions and use social features.
- Core typing practice and multiplayer must remain free. No paywall for core gameplay.
- English and Khmer are first-class locales. Khmer typing must support Unicode input, Khmer Unicode fonts, IME/composition events and configurable scoring. Do not assume one space-delimited word equals one Khmer word.
- WPM for English uses a conventional five-character word. Khmer results should use a separately labelled metric (for example, correct characters per minute / CPM) until a validated Khmer word segmentation and scoring convention is selected.
- Never calculate typing correctness from keydown events alone. Compare committed text input with the target text and handle `compositionstart`, `compositionupdate` and `compositionend`.
- Multiplayer race results must be server-authoritative. Client progress is a display hint, not a trusted result.
- Do not ship public matchmaking or ranked leaderboards without rate limits, abuse controls and server-side validation.
