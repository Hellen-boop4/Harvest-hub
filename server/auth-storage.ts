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
    // Optionally seed an in-memory default admin user when explicitly enabled.
    // This is useful for demo environments only. To enable set `SEED_DEFAULT_ADMIN=true`.
    if (process.env.SEED_DEFAULT_ADMIN === "true") {
      try {
        const salt = bcrypt.genSaltSync(8);
        const passwordHash = bcrypt.hashSync("admin", salt);
        const id = `user_seed_admin`;
        const user: AuthUser = {
          id,
          username: "admin",
          passwordHash,
          email: undefined,
          role: "admin",
        };
        // Do not overwrite if an admin already exists in this runtime
        if (!this.users.has("admin")) {
          this.users.set("admin", user);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to seed in-memory admin user:", err);
      }
    }
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
