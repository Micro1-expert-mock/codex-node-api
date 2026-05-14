# Changelog

This changelog tracks merged pull requests on `main`.

## 2026-05-12

### [#2] Secure GET and PATCH user endpoints with JWT
- Added shared JWT authentication for `GET /user/:userId` and `PATCH /user/:userId`.
- Implemented HS256 token parsing, signature verification, and expiration checks using `JWT_SECRET`.
- Returned `401` responses for missing, malformed, expired, or invalid bearer tokens while keeping `POST /login` publicly accessible.

## 2026-05-14

### [#4] Add Postgres database layer
- Replaced in-memory user handling with PostgreSQL-backed persistence for login, user reads, and user updates.
- Added `db.js` for connection pooling, schema initialization, seed users, password hashing, and query helpers.
- Updated `POST /login` to validate real credentials from the database and issue signed JWTs.
- Added `.env.example`, documented PostgreSQL setup and usage in `README.md`, and added the `pg` dependency with `package-lock.json`.

### [#3] Add changelog for merged PR history
- Added the initial `CHANGELOG.md` file to document merged pull requests on `main`.
- Backfilled the first changelog entry for PR `#2`.
