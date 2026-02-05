import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/connection';
import { User } from '../types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

export class AuthService {
  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const db = getDatabase();

    // Check if user already exists
    const existing = db
      .prepare('SELECT id FROM users WHERE username = ? OR email = ?')
      .get(username, email);

    if (existing) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const result = db
      .prepare(
        `
      INSERT INTO users (username, email, password_hash, current_level)
      VALUES (?, ?, ?, 1)
    `
      )
      .run(username, email, password_hash);

    // Get created user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }

  static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const db = getDatabase();

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
      | User
      | undefined;

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      throw new Error('Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }

  static verifyToken(token: string): { userId: number; username: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        username: string;
      };
      return decoded;
    } catch {
      throw new Error('Invalid token');
    }
  }

  static getUserById(userId: number): User | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
  }
}
