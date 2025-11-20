import bcrypt from "bcryptjs";

export interface AuthUser {
  id: string;
  username: string;
  passwordHash: string;
  email?: string;
  role?: string;
}

/**
 * In-memory auth storage - fallback when MongoDB is unavailable
 */
export class InMemoryAuthStorage {
  private users: Map<string, AuthUser>;

  constructor() {
    this.users = new Map();
  }

  async findUserByUsername(username: string): Promise<AuthUser | undefined> {
    return this.users.get(username);
  }

  async createUser(username: string, passwordHash: string, email?: string): Promise<AuthUser> {
    if (this.users.has(username)) {
      throw new Error("Username already exists");
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const user: AuthUser = {
      id,
      username,
      passwordHash,
      email,
      role: "user",
    };

    this.users.set(username, user);
    return user;
  }
}

export const inMemoryAuthStorage = new InMemoryAuthStorage();
