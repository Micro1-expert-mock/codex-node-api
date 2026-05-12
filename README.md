# Sample Node API

Small Node.js sample project with two endpoints:

- `POST /login`
- `GET /user/:userId`

## Run

```bash
npm start
```

The server starts on `http://localhost:3000`.

## Endpoints

### `POST /login`

Returns a dummy token and a user ID.

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
  "token": "dummy-token-abc123",
  "userId": "user-101"
}
```

### `GET /user/:userId`

Returns dummy user details. No authentication is required.

Example:

```bash
curl http://localhost:3000/user/user-101
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