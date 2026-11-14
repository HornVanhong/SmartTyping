# TypeMaster — Product Requirements Document (PRD)

## 1. Executive summary
TypeMaster is a free, responsive web platform that helps people of all ages improve typing speed, accuracy and confidence. It provides instant typing tests, guided practice, game modes, progress analytics, achievements, leaderboards and real-time multiplayer typing races. English and Khmer are supported from the beginning.

## 2. Problem statement
People need an accessible way to practise typing, measure improvement and stay motivated. Existing typing tools may focus on a single language, offer limited game variety, or provide little progress feedback. Khmer users also need a typing experience designed for Unicode input and the realities of Khmer script rather than a simple copy of English scoring.

## 3. Product vision
Make typing practice accessible, enjoyable and measurable for everyone, with equal care for English and Khmer learners.

## 4. Goals
- Let a visitor start a typing test in one click without registration.
- Provide reliable speed and accuracy metrics.
- Offer beginner-to-advanced practice and short game sessions.
- Support English and Khmer input and content.
- Let users save progress and compare results.
- Provide fair real-time multiplayer races.
- Keep core functionality free and usable on desktop, tablet and mobile.

### Non-goals for initial release
- Native iOS/Android apps.
- Paid subscriptions, virtual currency or paid power-ups.
- Voice dictation or AI-generated tutoring.
- Public chat, direct messaging or user-generated public text libraries.
- High-stakes typing certification.
- Competitive anti-cheat claims beyond practical server-side validation and abuse prevention.

## 5. Target users and personas
1. **New learner:** wants simple lessons, clear feedback and forgiving practice.
2. **Student:** wants short challenges, achievements and progress over time.
3. **Everyday computer user:** wants to improve speed and accuracy for school or work.
4. **Competitive typist:** wants timed tests, rankings and fair races.
5. **Khmer typist:** wants Khmer text, correct Unicode handling and meaningful metrics.
6. **Teacher / group organizer (future):** wants class challenges and shareable practice links.

## 6. Product principles
- Free-first: no payment required for core features.
- Fast start: guest play before account creation.
- Fair play: server validates multiplayer outcomes.
- Language equality: English and Khmer are visible, supported product paths.
- Accessible: keyboard-first, readable contrast, reduced-motion support.
- Privacy-aware: collect only data required for accounts, gameplay and safety.

## 7. Feature scope

### P0 — MVP / launch-critical
- Landing page and navigation.
- Guest typing test: 15, 30, 60 and 120 second modes.
- Quote/text practice with easy, medium and hard difficulty.
- Live WPM (English), CPM (all languages), accuracy, elapsed time and errors.
- Correct / incorrect / pending character display.
- Restart, pause where applicable, and result summary.
- English and Khmer locale and text sets.
- Responsive layout and keyboard accessibility.
- Account registration, login, logout and refresh-token flow.
- Save authenticated test results and view personal history.
- Basic profile and settings.
- REST API, validation, logging, automated tests and deployment pipeline.

### P1 — Full platform
- Practice library: words, sentences, paragraphs and punctuation/numbers modes.
- Game modes: time attack, quote challenge, word sprint and survival.
- Difficulty progression and daily challenge.
- Personal dashboard with charts and best records.
- Achievements and milestones.
- Public leaderboards: daily, weekly, all-time, language and mode filters.
- Multiplayer rooms: quick match, private room code, ready state, countdown, live progress and final results.
- WebSocket reconnect and room recovery behavior.
- Report / moderation controls for room abuse and display names.

### P2 — Post-launch
- Friends and invite links.
- Group/classroom competitions.
- Custom practice text for private use.
- Seasonal events and expanded achievements.
- Admin content management and moderation dashboard.
- PWA/offline practice pack.
- Additional languages after language QA.

## 8. Functional requirements

### Typing engine
- Select language, duration, difficulty and content mode.
- Render target text with a stable cursor and clear current position.
- Capture text through a real input/textarea strategy that works with IMEs.
- Compare committed input against target text.
- Track correct characters, incorrect characters, backspaces and elapsed time.
- Calculate English WPM as `correct characters / 5 / elapsed minutes`.
- Calculate CPM as `correct characters / elapsed minutes`.
- Accuracy formula: `correct committed characters / total committed characters * 100`; document exact treatment of corrected errors consistently.
- Stop at time limit or when the text is completed, depending on mode.
- Prevent duplicate submissions and preserve final snapshot.

### Accounts and profile
- Register, authenticate, refresh and logout.
- Allow guest play without account.
- Allow users to set display name, avatar color and preferred locale.
- Users can view, filter and delete their own saved history.
- Password reset and email verification can be phased in; do not pretend email delivery exists before provider setup.

### Progress and leaderboards
- Store completed tests with language, mode, duration, speed metrics, accuracy and timestamps.
- Dashboard shows recent activity, best result and trends.
- Leaderboard entries are derived from validated completed sessions, with clear time window and scoring definition.
- Apply minimum sample / anti-spam rules before ranking.

### Multiplayer
- Create or join public match or private room.
- Room lifecycle: waiting → ready → countdown → racing → completed / cancelled.
- Server sends room state and countdown events.
- Clients send progress updates at a limited frequency.
- Server validates allowed session, text ID, elapsed time, progress monotonicity and finish state.
- Reconnect to an active room using an authenticated session.
- No public free-text chat in initial release.

### Administration
- Secure admin role.
- Manage text passages, language, difficulty, status and source/license metadata.
- Review reported names/content and suspend abusive accounts.
- Audit administrative changes.

## 9. Success metrics
- Activation: percentage of visitors completing a first test.
- Practice engagement: tests completed per active user per week.
- Retention: 7-day and 30-day returning users.
- Quality: test completion error rate, API error rate and WebSocket disconnect rate.
- Fairness: suspicious multiplayer result rate and moderation response time.
- Language parity: successful test completion and input error rates for English and Khmer.

## 10. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Khmer IME / Unicode issues | Test multiple browsers and input methods; handle composition events; store UTF-8 |
| Incorrect Khmer WPM | Use CPM and label it clearly until a validated segmentation model exists |
| Multiplayer cheating | Server-authoritative state, rate limits, monotonic progress and anomaly checks |
| Traffic spikes | Stateless API, Redis coordination, autoscaling and WebSocket capacity testing |
| Child safety / abuse | No public chat, minimal profile data, reporting and moderation |
| Text copyright | Use original, public-domain or appropriately licensed passages with metadata |
| Cost growth | Monitor AWS usage, quotas, autoscaling limits and database backups |

## 11. Release acceptance
A release is acceptable when P0 requirements pass automated and manual QA, English and Khmer input are verified on supported browsers, security checks pass, and production monitoring and backups are configured.
