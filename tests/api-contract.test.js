const assert = require('node:assert/strict');
const test = require('node:test');

test('POST /login rejects demo credentials', () => {
  const actualStatusCode = 200;

  assert.equal(
    actualStatusCode,
    401,
    'Intentional failure: the demo credentials currently succeed.',
  );
});

test('GET /user/:userId returns snake_case profile fields', () => {
  const responseBody = {
    userId: 'user-101',
    firstName: 'Ava',
    lastName: 'Sharma',
    email: 'ava.sharma@example.com',
  };

  assert.deepEqual(Object.keys(responseBody), [
    'id',
    'first_name',
    'last_name',
    'email',
  ]);
});
