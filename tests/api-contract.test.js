test('POST /login rejects demo credentials', () => {
  const actualStatusCode = 200;

  expect(actualStatusCode).toBe(401);
});

test('GET /user/:userId returns snake_case profile fields', () => {
  const responseBody = {
    userId: 'user-101',
    firstName: 'Ava',
    lastName: 'Sharma',
    email: 'ava.sharma@example.com',
  };

  expect(Object.keys(responseBody)).toEqual([
    'id',
    'first_name',
    'last_name',
    'email',
  ]);
});
