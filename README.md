# Sample Node API

Small Node.js sample project backed by PostgreSQL.

Endpoints:

- `POST /login`
- `GET /user/:userId`
- `PATCH /user/:userId`

## Local development

1. Start the bundled Postgres service:

```bash
docker compose up -d postgres
```

Wait until `docker compose ps` shows `sample-node-api-postgres` as `healthy`.

2. Export the database settings from `.env.example` into your shell. In `bash` or `zsh`:

```bash
set -a
source .env.example
set +a
```

The app reads environment variables directly, so it will not auto-load `.env.example` on its own.

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

The server starts on `http://127.0.0.1:3000`.

If you already have PostgreSQL running locally, you can skip Docker Compose and point the `PG*` variables or `DATABASE_URL` at that instance instead.

## Quality checks

Run the Jest test suite:

```bash
npm test
```

Run the ESLint checks:

```bash
npm run lint
```

Both commands currently include intentional failures for CI testing.

On first start, the app creates the `users` table automatically and seeds two users:

- `demo` / `demo`
- `noah` / `demo`

To stop the local database:

```bash
docker compose down
```

Run `docker compose down -v` to remove the local data volume and reseed the database from scratch on the next start.

## Environment

Use either the individual `PG*` variables or a single `DATABASE_URL`.

`.env.example` matches the Docker Compose defaults.

Example:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=sample_node_api
```

Or:

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sample_node_api
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
