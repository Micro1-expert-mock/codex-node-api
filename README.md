# Sample Node API

Small Node.js sample project backed by PostgreSQL.

Endpoints:

- `POST /login`
- `GET /user/:userId`
- `PATCH /user/:userId`

## Setup

1. Create a PostgreSQL database.
2. Copy `.env.example` values into your shell or environment.
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

The server starts on `http://localhost:3000`.

## Quality checks

Run the test suite:

```bash
npm test
```

Run the lint checks:

```bash
npm run lint
```

Both commands currently include intentional failures for CI testing.

On first start, the app creates the `users` table automatically and seeds two users:

- `demo` / `demo`
- `noah` / `demo`

## Environment

Use either the individual `PG*` variables or a single `DATABASE_URL`.

Example:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=sample_node_api
```

## Endpoints

### `POST /login`

Validates credentials against PostgreSQL and returns a JWT plus the matching user ID.

Example:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo"}'
```

Sample response:

```json
{
  "message": "Login successful",
  "token": "<jwt-token>",
  "userId": "user-101"
}
```

### `GET /user/:userId`

Requires a bearer token and returns user details from PostgreSQL.

Example:

```bash
curl http://localhost:3000/user/user-101 \
  -H "Authorization: Bearer <jwt-token>"
```

Sample response:

```json
{
  "userId": "user-101",
  "firstName": "Ava",
  "lastName": "Sharma",
  "email": "ava.sharma@example.com"
}
```

### `PATCH /user/:userId`

Requires a bearer token and updates user fields in PostgreSQL.

Example:

```bash
curl -X PATCH http://localhost:3000/user/user-101 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"firstName":"Maya","email":"maya.sharma@example.com"}'
```

Sample response:

```json
{
  "message": "User updated successfully",
  "user": {
    "userId": "user-101",
    "firstName": "Maya",
    "lastName": "Sharma",
    "email": "maya.sharma@example.com"
  }
}
```
