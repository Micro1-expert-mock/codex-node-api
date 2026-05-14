const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl:
    process.env.PGSSLMODE === 'require'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
});

function buildPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPasswordHash) {
  const [salt, storedHash] = storedPasswordHash.split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const computedBuffer = Buffer.from(computedHash, 'hex');

  if (storedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, computedBuffer);
}

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const countResult = await client.query(
      'SELECT COUNT(*)::int AS count FROM users',
    );

    if (countResult.rows[0].count === 0) {
      const seedUsers = [
        {
          userId: 'user-101',
          username: 'demo',
          password: 'demo',
          firstName: 'Ava',
          lastName: 'Sharma',
          email: 'ava.sharma@example.com',
        },
        {
          userId: 'user-102',
          username: 'noah',
          password: 'demo',
          firstName: 'Noah',
          lastName: 'Patel',
          email: 'noah.patel@example.com',
        },
      ];

      for (const user of seedUsers) {
        await client.query(
          `
            INSERT INTO users (
              id,
              username,
              password_hash,
              first_name,
              last_name,
              email
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            user.userId,
            user.username,
            buildPasswordHash(user.password),
            user.firstName,
            user.lastName,
            user.email,
          ],
        );
      }
    }
  } finally {
    client.release();
  }
}

async function findUserByUsername(username) {
  const result = await pool.query(
    `
      SELECT
        id AS "userId",
        username,
        password_hash AS "passwordHash",
        first_name AS "firstName",
        last_name AS "lastName",
        email
      FROM users
      WHERE username = $1
    `,
    [username],
  );

  return result.rows[0] || null;
}

async function getUserById(userId) {
  const result = await pool.query(
    `
      SELECT
        id AS "userId",
        first_name AS "firstName",
        last_name AS "lastName",
        email
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  return result.rows[0] || null;
}

async function updateUser(userId, updates) {
  const assignments = [];
  const values = [];

  if (updates.firstName !== undefined) {
    values.push(updates.firstName);
    assignments.push(`first_name = $${values.length}`);
  }

  if (updates.lastName !== undefined) {
    values.push(updates.lastName);
    assignments.push(`last_name = $${values.length}`);
  }

  if (updates.email !== undefined) {
    values.push(updates.email);
    assignments.push(`email = $${values.length}`);
  }

  if (assignments.length === 0) {
    return getUserById(userId);
  }

  assignments.push('updated_at = NOW()');
  values.push(userId);

  const result = await pool.query(
    `
      UPDATE users
      SET ${assignments.join(', ')}
      WHERE id = $${values.length}
      RETURNING
        id AS "userId",
        first_name AS "firstName",
        last_name AS "lastName",
        email
    `,
    values,
  );

  return result.rows[0] || null;
}

module.exports = {
  initializeDatabase,
  findUserByUsername,
  getUserById,
  updateUser,
  verifyPassword,
};
