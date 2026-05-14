require('reflect-metadata');

const crypto = require('crypto');
const { DataSource, EntitySchema } = require('typeorm');

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'varchar',
      primary: true,
    },
    username: {
      type: 'varchar',
      unique: true,
    },
    passwordHash: {
      name: 'password_hash',
      type: 'varchar',
    },
    firstName: {
      name: 'first_name',
      type: 'varchar',
    },
    lastName: {
      name: 'last_name',
      type: 'varchar',
    },
    email: {
      type: 'varchar',
      unique: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
});

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl:
    process.env.PGSSLMODE === 'require'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  synchronize: true,
  logging: false,
  entities: [UserEntity],
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

function getUserRepository() {
  return AppDataSource.getRepository('User');
}

function toPublicUser(user) {
  return {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

function toAuthUser(user) {
  return {
    userId: user.id,
    username: user.username,
    passwordHash: user.passwordHash,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}

async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const repository = getUserRepository();
  const count = await repository.count();

  if (count === 0) {
    const seedUsers = [
      {
        id: 'user-101',
        username: 'demo',
        passwordHash: buildPasswordHash('demo'),
        firstName: 'Ava',
        lastName: 'Sharma',
        email: 'ava.sharma@example.com',
      },
      {
        id: 'user-102',
        username: 'noah',
        passwordHash: buildPasswordHash('demo'),
        firstName: 'Noah',
        lastName: 'Patel',
        email: 'noah.patel@example.com',
      },
    ];

    await repository.save(seedUsers);
  }
}

async function findUserByUsername(username) {
  const repository = getUserRepository();
  const user = await repository.findOne({
    where: {
      username,
    },
  });

  return user ? toAuthUser(user) : null;
}

async function getUserById(userId) {
  const repository = getUserRepository();
  const user = await repository.findOne({
    where: {
      id: userId,
    },
  });

  return user ? toPublicUser(user) : null;
}

async function updateUser(userId, updates) {
  const repository = getUserRepository();
  const user = await repository.findOne({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return null;
  }

  if (updates.firstName !== undefined) {
    user.firstName = updates.firstName;
  }

  if (updates.lastName !== undefined) {
    user.lastName = updates.lastName;
  }

  if (updates.email !== undefined) {
    user.email = updates.email;
  }

  const updatedUser = await repository.save(user);

  return toPublicUser(updatedUser);
}

module.exports = {
  initializeDatabase,
  findUserByUsername,
  getUserById,
  updateUser,
  verifyPassword,
};
