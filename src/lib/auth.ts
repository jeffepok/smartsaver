import bcrypt from 'bcrypt';
import db from './db';

export interface User {
  id: number;
  email: string;
  name?: string;
  password?: string;
}

/**
 * Create a new user account
 */
export async function createUser(email: string, password: string, name?: string): Promise<User | null> {
  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the user into the database
    const stmt = db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    );

    const result = stmt.run(email, hashedPassword, name || null);

    if (result.lastInsertRowid) {
      return {
        id: Number(result.lastInsertRowid),
        email,
        name: name || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Verify a user's credentials
 */
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email) as User;

    if (!user) {
      return null;
    }
    if (!user.password) throw Error("User record has no password.")

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

/**
 * Get user by ID
 */
export function getUserById(id: number): User | null {
  try {
    const stmt = db.prepare('SELECT id, email, name FROM users WHERE id = ?');
    const user = stmt.get(id);

    if (!user) {
      return null;
    }

    return user as User;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): User | null {
  try {
    const stmt = db.prepare('SELECT id, email, name FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      return null;
    }

    return user as User;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}
