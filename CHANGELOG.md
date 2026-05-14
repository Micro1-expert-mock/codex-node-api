# Changelog

## Merged Pull Requests

### 2026-05-14

#### [#4] Add Postgres database layer
- Replaced the in-memory data store with PostgreSQL-backed authentication and user read/update flows.
- Updated `POST /login` to validate real credentials and return a signed JWT for database-backed users.
- Added `db.js` for connection pooling, schema initialization, seed data, and user queries.
- Added `.env.example`, the `pg` dependency, and `package-lock.json` for database-backed setup.
- Updated the README with PostgreSQL configuration, startup, and endpoint usage details.

#### [#3] Add changelog for merged PR history
- Added `CHANGELOG.md` to track repository changes through merged pull requests.
- Seeded the changelog with the initial JWT-authentication entry from PR `#2`.

### 2026-05-12

#### [#2] Secure GET and PATCH user endpoints with JWT
- Added shared JWT authentication for `GET /user/:userId` and `PATCH /user/:userId`.
- Added manual HS256 JWT validation using `JWT_SECRET`, including signature and expiration checks.
- Added `401` responses for missing, malformed, expired, or invalid bearer tokens.
- Kept `POST /login` unchanged so token issuance remains publicly accessible.
