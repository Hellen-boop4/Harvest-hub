import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, setUseInMemoryAuth } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDB } from "./db";
import bcrypt from "bcryptjs";
import { User } from "./models/User";


const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
// Add CORS headers to handle development requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB
  try {
    await connectDB();
    log("✓ MongoDB connected");
    // Optionally seed a default admin user when explicitly enabled.
    // To enable: set environment variable `SEED_DEFAULT_ADMIN=true` before starting.
    if (process.env.SEED_DEFAULT_ADMIN === "true") {
      try {
        const existingAdmin = await User.findOne({ username: "admin" });
        if (!existingAdmin) {
          const salt = await bcrypt.genSalt(8);
          const passwordHash = await bcrypt.hash("admin", salt);
          const newUser = new User({ username: "admin", passwordHash, role: "admin" });
          await newUser.save();
          log("✓ Seeded default admin user (username: admin, password: admin)");
        } else {
          log("Default admin user already exists");
        }
      } catch (seedErr: any) {
        log(`⚠ Failed to seed admin user: ${seedErr?.message || seedErr}`);
      }
    } else {
      log("(seeding disabled) Set SEED_DEFAULT_ADMIN=true to create default admin user on startup");
    }

    // Always ensure a basic non-admin user 'mwende' exists for operational use
    try {
      const existingMwende = await User.findOne({ username: "mwende" });
      if (!existingMwende) {
        const salt = await bcrypt.genSalt(8);
        const passwordHash = await bcrypt.hash("mwende", salt);
        const newUser = new User({ username: "mwende", passwordHash, role: "user" });
        await newUser.save();
        log("✓ Seeded default user (username: mwende, password: mwende, role: user)");
      } else {
        log("Default user 'mwende' already exists");
      }
    } catch (seedUserErr: any) {
      log(`⚠ Failed to seed default user 'mwende': ${seedUserErr?.message || seedUserErr}`);
    }
  } catch (error: any) {
    log(`✗ MongoDB connection failed: ${error.message}`);
    log("⚠ Using in-memory auth storage for testing. Farmer persistence will not work.");
    setUseInMemoryAuth(true);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
