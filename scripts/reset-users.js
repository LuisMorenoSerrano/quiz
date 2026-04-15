#!/usr/bin/env node

/**
 * Reset demo users to known state.
 * Usage: npm run reset-demo-users
 *
 * This script:
 * - Drops the User table if it exists
 * - Recreates it with the proper schema
 * - Seeds three demo users with known credentials
 * - Preserves all other tables (Quiz, Subject, Comment)
 */

var path = require('node:path');
var Sequelize = require('sequelize');

// Load database configuration (same as models.js)
var databaseUrl = process.env.DATABASE_URL || 'sqlite://:@:/';
var storage = process.env.DATABASE_STORAGE || 'quiz.sqlite';
var dialect = null;
var sequelize = null;

if (/^sqlite:/i.test(databaseUrl)) {
  dialect = 'sqlite';
  sequelize = new Sequelize({
    dialect: dialect,
    storage: storage,
    omitNull: true
  });
} else {
  const parsedUrl = new URL(databaseUrl);
  dialect = (parsedUrl.protocol || '').replace(':', '');
  sequelize = new Sequelize(databaseUrl, {
    dialect: dialect,
    protocol: dialect,
    omitNull: true
  });
}

// Define User model (same schema as models/user.js)
var User = sequelize.define('User', {
  username: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: '\u21E8 Missing Username' }
    }
  },
  salt: {
    type: Sequelize.DataTypes.STRING(32),
    allowNull: false,
    validate: {
      notEmpty: { msg: '\u21E8 Missing Salt' }
    }
  },
  passwordHash: {
    type: Sequelize.DataTypes.STRING(128),
    allowNull: false,
    validate: {
      notEmpty: { msg: '\u21E8 Missing Password Hash' }
    }
  }
});

// Demo users with hashed passwords
var demoUsers = [
  {
    username: 'admin',
    salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    passwordHash: '881feecad21371989a4e9385a5f4d1bd851f9a05fe562b738b9e2b59b6b85862caec7da7a664d691eeeb461968a7abf3cbce60d1bf0c1fe75cff7114a00d46a1'
  },
  {
    username: 'pepe',
    salt: '0f9e8d7c6b5a49382716151413121110',
    passwordHash: '1979471aac79bc37192cf2475d2d245586d8d8fbb73527276d14047e05500a0b27cb1a0280a549179dec85addee91724c913fc6e828a5434376ca530db0d364b'
  },
  {
    username: 'luis',
    salt: '11223344556677889900aabbccddeeff',
    passwordHash: '567f65c242041135b67976b7cfff9b97491fd876cf2df20f5d06a6f31e3ee2e2a56455e0a1d5ff1884e616c6e13899959cf5e5ef4528765eee925942ccf8fd68'
  }
];

console.log('Resetting demo users...\n');

sequelize.sync({ force: true }).then(() => {
  console.log('✓ User table dropped and recreated.\n');

  return Promise.all(
    demoUsers.map((userData) => {
      return User.create(userData).then(() => {
        console.log(`✓ Created user: ${userData.username}`);
      });
    })
  );
}).then(() => {
  console.log('\n✓ Demo users reset successfully!\n');
  console.log('Available credentials:');
  console.log('  admin: 1234');
  console.log('  pepe:  5678');
  console.log('  luis:  9012\n');
  process.exit(0);
}).catch((error) => {
  console.error('✗ Error resetting users:', error.message);
  process.exit(1);
});
