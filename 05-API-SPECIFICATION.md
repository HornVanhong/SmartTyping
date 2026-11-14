# TypeMaster — API Specification

Base path: `/api/v1`. JSON uses UTF-8. All timestamps are ISO-8601 UTC. IDs are UUIDs. Use consistent Problem Details-style errors as described in the SRS.

## 1. Authentication
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Authenticate; set secure cookies |
| POST | `/auth/refresh` | Refresh cookie | Rotate refresh token |
| POST | `/auth/logout` | Optional | Revoke refresh token and clear cookies |
| GET | `/auth/me` | Member | Current user |

Register request:
```json
{"email":"player@example.com","password":"StrongPassword123!","displayName":"TypingFan","preferredLocale":"en"}
```
Response:
```json
{"id":"uuid","email":"player@example.com","displayName":"TypingFan","preferredLocale":"en","role":"MEMBER"}
```
Never return password hashes or raw tokens.

## 2. Passages
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/passages/random` | Public | Get a random published passage |
| GET | `/passages/{id}` | Public | Get published passage |
| GET | `/passages` | Public | Filter and paginate catalog |

Query parameters: `locale`, `difficulty`, `contentMode`, `category`, `page`, `size`.
Example response:
```json
{"id":"uuid","locale":"km","difficulty":"BEGINNER","contentMode":"SENTENCES","content":"...","category":"GENERAL"}
```

## 3. Typing sessions and history
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/typing-sessions` | Optional | Submit completed test |
| GET | `/typing-sessions/me` | Member | List own history |
| GET | `/typing-sessions/me/{id}` | Member | Read own result |
| DELETE | `/typing-sessions/me/{id}` | Member | Delete own result |

Submit request:
```json
{
  "passageId":"uuid",
  "locale":"en",
  "mode":"TIME_30",
  "durationSeconds":30,
  "elapsedMs":30000,
  "correctCharacters":180,
  "incorrectCharacters":5,
  "totalCharacters":185,
  "clientCpm":360,
  "clientWpm":72,
  "clientAccuracy":97.30
}
```
The server must recompute or validate metrics where possible. Client values are hints, not trusted ranking values. Reject impossible values and mark questionable results `rankedEligible=false`.

## 4. Profile and stats
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/users/me` | Member | Profile |
| PATCH | `/users/me` | Member | Update display name, locale, avatar |
| DELETE | `/users/me` | Member | Request account deletion |
| GET | `/stats/me/summary` | Member | Summary |
| GET | `/stats/me/trend` | Member | Historical trend |

## 5. Leaderboards
`GET /leaderboards?period=DAILY&locale=en&mode=TIME_30&page=0&size=20`

Response:
```json
{
  "period":"DAILY",
  "locale":"en",
  "mode":"TIME_30",
  "items":[
    {"rank":1,"userId":"uuid","displayName":"FastFingers","wpm":85.2,"accuracy":98.1}
  ],
  "page":0,
  "size":20,
  "totalItems":1
}
```
Define tie-breaker: primary score descending, accuracy descending, then completion timestamp ascending. Only ranked-eligible sessions qualify.

## 6. Multiplayer REST
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/rooms` | Member | Create room |
| POST | `/rooms/{code}/join` | Member | Join room |
| GET | `/rooms/{code}` | Member | Read room snapshot |
| POST | `/rooms/{code}/ready` | Member | Mark ready |
| POST | `/rooms/{code}/leave` | Member | Leave room |

Create request:
```json
{"locale":"en","difficulty":"INTERMEDIATE","isPrivate":true,"maxPlayers":5}
```
Response:
```json
{"roomCode":"AB12CD","status":"WAITING","webSocketPath":"/ws"}
```

## 7. WebSocket contract
Connect to `/ws` over WSS in production. Authenticate using the configured secure handshake/cookie mechanism. Do not put long-lived tokens in query strings.

Client destinations:
- `/app/room.join`
- `/app/room.ready`
- `/app/race.progress`
- `/app/room.leave`

Server subscriptions:
- `/topic/rooms/{roomCode}`
- `/user/queue/errors`

Example client progress:
```json
{"roomCode":"AB12CD","progressCharacters":42,"correctCharacters":40,"incorrectCharacters":2}
```
Server event examples:
```json
{"type":"RACE_COUNTDOWN","startsAt":"2026-11-14T00:00:00Z","countdownSeconds":3}
```
```json
{"type":"PARTICIPANT_PROGRESS","userId":"uuid","progressCharacters":42,"cpm":240}
```
```json
{"type":"RACE_FINISHED","results":[{"userId":"uuid","placement":1,"cpm":310.4,"wpm":62.1}]}
```
The server validates room membership, message size, message frequency, monotonic progress, passage bounds and race state. Final scores are computed server-side.

## 8. Admin endpoints
- `POST /admin/passages`
- `PATCH /admin/passages/{id}`
- `POST /admin/passages/{id}/publish`
- `POST /admin/passages/{id}/archive`
- `GET /admin/reports`
- `PATCH /admin/reports/{id}`
- `GET /admin/audit-logs`

All require ADMIN or explicitly permitted MODERATOR roles. Use server-side authorization and audit logging.

## 9. API conventions
- Pagination: zero-based `page`, bounded `size` (default 20, max 100).
- Filtering and sorting must use allowlisted fields.
- Idempotency key recommended for result submission.
- Rate-limit public endpoints and authentication.
- Version breaking API changes under a new version.
- Generate OpenAPI documentation from Spring controllers and DTOs.
