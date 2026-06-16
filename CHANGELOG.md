# Changelog

## Merged Pull Requests

### 2026-05-14

#### [#4] Add Postgres database layer
- Replaced the in-memory user store with PostgreSQL-backed login, user reads, and user updates.
- Added `db.js` for connection pooling, schema initialization, sample-user seeding, password hashing, and query helpers.
- Changed `POST /login` to validate real credentials and issue signed JWTs for protected routes.
- Added `.env.example`, the `pg` dependency, `package-lock.json`, and README setup/docs for running against Postgres.

#### [#3] Add changelog for merged PR history
- Added `CHANGELOG.md` to track merged pull requests on `main`.
- Documented the JWT protection rollout as the initial changelog entry.

### 2026-05-12

#### [#2] Secure GET and PATCH user endpoints with JWT
- Added shared JWT authentication for `GET /user/:userId` and `PATCH /user/:userId`.
- Added manual HS256 JWT validation using `JWT_SECRET`, including signature and expiration checks.
- Added `401` responses for missing, malformed, expired, or invalid bearer tokens.
- Kept `POST /login` unchanged so token issuance remains publicly accessible.
