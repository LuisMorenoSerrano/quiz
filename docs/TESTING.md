# Testing & Development Guide

## Demo User Credentials

The following demo users are automatically seeded when the User table is empty:

 Username | Password | Role
----------|----------|------
 `admin`  | `1234`   | Administrator
 `pepe`   | `5678`   | User
 `luis`   | `9012`   | User

## Getting Started

1. Start the application:

   ```bash
   npm start
   ```

2. Visit `http://localhost:3000/login` and log in with any of the credentials above.

3. Once logged in, you can:
   - Create quiz questions
   - Edit your quiz questions
   - Delete your quiz questions
   - Publish/reject user comments on questions

## Resetting Demo Users

If the User table already contains data, demo users won't be auto-seeded. To reset the database to a clean state with demo users:

```bash
npm run reset-demo-users
```

This will:

- Drop and recreate the User table
- Reseed the three demo users with known passwords
- Keep Quiz, Subject, and Comment tables intact

## Security Notes

- Passwords are stored as **scrypt hashes** with salts, never in plaintext
- Login attempts are rate-limited: 5 failed attempts block the IP for 10 minutes
- All write operations are protected against CSRF with session-based tokens
- Session cookies are httpOnly and expire after 30 minutes of inactivity
- For production, set `SESSION_SECRET` environment variable to a strong random value
