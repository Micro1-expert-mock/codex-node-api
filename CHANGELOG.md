# Changelog

## Merged Pull Requests

### 2026-05-12

#### [#2] Secure GET and PATCH user endpoints with JWT
- Added shared JWT authentication for `GET /user/:userId` and `PATCH /user/:userId`.
- Added manual HS256 JWT validation using `JWT_SECRET`, including signature and expiration checks.
- Added `401` responses for missing, malformed, expired, or invalid bearer tokens.
- Kept `POST /login` unchanged so token issuance remains publicly accessible.
