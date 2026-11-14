# TypeMaster — UI/UX Guidelines

## 1. Design direction
Create a clean, modern, playful-but-focused typing experience. The typing test is the hero: minimal distractions, readable text and immediate feedback. Use a dark-first interface with a polished light theme if time permits.

## 2. Visual identity
- Product name: TypeMaster
- Personality: friendly, focused, competitive, inclusive.
- Suggested palette:
  - Background: `#101318`
  - Surface: `#191F27`
  - Elevated surface: `#222B36`
  - Primary: `#7C8CFF`
  - Accent: `#4ED6B8`
  - Text: `#F2F4F8`
  - Muted text: `#9AA5B4`
  - Error: `#FF6B75`
  - Success: `#4ED6B8`
- Use semantic tokens, not hard-coded colors throughout components.
- Use a consistent 8px spacing scale and 8–16px corner radii.

## 3. Typography
- English: Inter, Geist or system sans-serif.
- Khmer: Noto Sans Khmer or a locally hosted Khmer-capable font with appropriate licensing.
- Typing passage: monospace for Latin text only if legibility remains high; use a Khmer-capable sans-serif for Khmer.
- Verify glyph shaping, line-height and fallback on Windows, macOS, Android and iOS.
- Avoid overly small text; use 16px minimum for main passage content.

## 4. Navigation
Primary navigation:
- Play
- Practice
- Games
- Multiplayer
- Leaderboard
- Dashboard (authenticated)
- Profile menu / Sign in

Keep the primary “Start typing” action obvious. On mobile, use a compact menu and keep the test controls reachable.

## 5. Key screens

### Landing / Play
- Header with logo, locale switcher and account action.
- Hero statement and Start typing CTA.
- Embedded quick test or clear link to test.
- Feature cards for practice, games and multiplayer.
- A small public leaderboard preview.
- Footer with About, Privacy, Terms and language selection.

### Typing test
- Top control row: language, duration, difficulty and mode.
- Metrics row: time, WPM, CPM, accuracy.
- Passage area with large line-height and clear current character.
- Distinguish correct, incorrect and upcoming characters using more than color alone (underline/shape or accessible status).
- Keep input focus reliable; do not hijack keyboard shortcuts used by assistive technology.
- Restart control and keyboard shortcut hint.
- On completion, show result summary, personal best comparison and retry action.

### Results
- Highlight speed and accuracy without overstating precision.
- Show CPM for both languages; show WPM for English.
- Display error count, duration, language and mode.
- Actions: retry, change mode, save/sign in, share result (only share non-sensitive summary).

### Dashboard
- Summary cards: tests completed, best WPM/CPM, average accuracy and practice time.
- Trend chart with date range and language filter.
- Recent sessions table/list.
- Achievements with clear progress state.

### Multiplayer
- Create/join room panel and room code.
- Waiting room with participant list and ready state.
- Countdown overlay and synchronized start.
- Race track with progress bars, names and clear finish states.
- Results ordered by server placement.
- Reconnect state and clear network error handling.

### Khmer localization
- Use correct Khmer font coverage and line-height.
- Ensure text does not clip in buttons, navigation, charts or tables.
- Use Khmer sample passages reviewed by fluent speakers.
- Do not display English WPM label for Khmer. Prefer “CPM / តួអក្សរក្នុងមួយនាទី”.
- Test Khmer Unicode composition and backspace behavior on real devices.

## 6. Interaction
- Immediate local feedback while typing.
- Smooth but restrained animations; respect `prefers-reduced-motion`.
- Loading skeletons for content and dashboard.
- Empty states explain the next action.
- Confirm destructive actions.
- Toasts for saved results, room join failures and connection changes.
- Do not move focus unexpectedly.

## 7. Accessibility
- Target WCAG 2.2 AA.
- Keyboard-accessible controls and visible focus.
- Semantic landmarks and heading hierarchy.
- Labels for inputs; accessible names for icon buttons.
- Contrast ratio at least 4.5:1 for normal text.
- Do not rely on color alone for correct/incorrect states.
- Announce timer completion and race status without announcing every keystroke.
- Support zoom and reduced motion.

## 8. Responsive behavior
- Desktop: wide passage area and full metrics row.
- Tablet: wrap controls and reduce side margins.
- Mobile: single-column controls; avoid opening the software keyboard until the user chooses to start; ensure the typing area remains usable.
- Multiplayer should remain readable on narrow screens, with compact participant progress.

## 9. UX quality checklist
- A first-time visitor can start in one click.
- Test controls are understandable without documentation.
- Focus remains in the typing input.
- Khmer glyphs and IME composition work.
- Result metrics have clear labels and units.
- Network interruption never silently discards an authenticated result.
- Every interactive state has loading, success, empty and error behavior.
