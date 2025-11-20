import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Farmer } from "./models/Farmer";
import { User } from "./models/User";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "./middleware/auth";
import { inMemoryAuthStorage } from "./auth-storage";

let useInMemoryAuth = false;

export function setUseInMemoryAuth(value: boolean) {
  useInMemoryAuth = value;
}

export function getUseInMemoryAuth() {
  return useInMemoryAuth;
}


export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes

  // Register a new farmer (protected)
  app.post("/api/farmers", verifyToken, async (req, res) => {
    try {
      const { memberNo, firstName, middleName, surname, phone, email, idNumber, idType, city, county, address, dob, gender, maritalStatus, kraPIN, employerName, payrollStaffNo, memberCategory, status } = req.body;

      // Validate required fields
      if (!memberNo || !firstName || !surname || !phone || !idNumber) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if farmer already exists
      const existingFarmer = await Farmer.findOne({ idNumber });
      if (existingFarmer) {
        return res.status(409).json({ error: "Farmer with this ID number already exists" });
      }

      // Create new farmer
      const farmer = new Farmer({
        memberNo,
        firstName,
        middleName,
        surname,
        phone,
        email,
        idNumber,
        idType,
        city,
        county,
        address,
        dob,
        gender,
        maritalStatus,
        kraPIN,
        employerName,
        payrollStaffNo,
        memberCategory,
        status: status || "active",
      });

      await farmer.save();

      res.status(201).json({
        success: true,
        message: "Farmer registered successfully",
        farmer: farmer,
      });
    } catch (error: any) {
      console.error("Error registering farmer:", error);
      res.status(500).json({ error: error.message || "Failed to register farmer" });
    }
  });

  // Get all farmers
  app.get("/api/farmers", async (req, res) => {
    try {
      const farmers = await Farmer.find().sort({ registeredAt: -1 });
      res.json({
        success: true,
        farmers: farmers,
        count: farmers.length,
      });
    } catch (error: any) {
      console.error("Error fetching farmers:", error);
      res.status(500).json({ error: error.message || "Failed to fetch farmers" });
    }
  });

  // Get farmer by ID
  app.get("/api/farmers/:id", async (req, res) => {
    try {
      const farmer = await Farmer.findById(req.params.id);
      if (!farmer) {
        return res.status(404).json({ error: "Farmer not found" });
      }
      res.json({
        success: true,
        farmer: farmer,
      });
    } catch (error: any) {
      console.error("Error fetching farmer:", error);
      res.status(500).json({ error: error.message || "Failed to fetch farmer" });
    }
  });

  // Update farmer (protected)
  app.put("/api/farmers/:id", verifyToken, async (req, res) => {
    try {
      const farmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!farmer) {
        return res.status(404).json({ error: "Farmer not found" });
      }
      res.json({
        success: true,
        message: "Farmer updated successfully",
        farmer: farmer,
      });
    } catch (error: any) {
      console.error("Error updating farmer:", error);
      res.status(500).json({ error: error.message || "Failed to update farmer" });
    }
  });

  // Delete farmer (protected)
  app.delete("/api/farmers/:id", verifyToken, async (req, res) => {
    try {
      const farmer = await Farmer.findByIdAndDelete(req.params.id);
      if (!farmer) {
        return res.status(404).json({ error: "Farmer not found" });
      }
      res.json({
        success: true,
        message: "Farmer deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting farmer:", error);
      res.status(500).json({ error: error.message || "Failed to delete farmer" });
    }
  });

  const httpServer = createServer(app);

  // --- Authentication endpoints ---
  // Register user (creates a new account and returns a token)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      console.log("[Server] Register attempt:", username);

      if (!username || !password) {
        console.log("[Server] Missing username or password");
        return res.status(400).json({ error: "Missing username or password" });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let user: any;
      if (useInMemoryAuth) {
        console.log("[Server] Using in-memory auth for registration");
        // Use in-memory storage if MongoDB is unavailable
        user = await inMemoryAuthStorage.createUser(username, passwordHash, email);
      } else {
        console.log("[Server] Using MongoDB for registration");
        // Try to use MongoDB
        const existing = await User.findOne({ username });
        if (existing) {
          console.log("[Server] Username already exists:", username);
          return res.status(409).json({ error: "Username already exists" });
        }

        const newUser = new User({ username, email, passwordHash });
        user = await newUser.save();
      }

      const token = generateToken({ id: user._id?.toString() || user.id, username: user.username, role: user.role });
      console.log("[Server] Registration successful for user:", username);
      res.json({ success: true, token, user: { id: user._id || user.id, username: user.username, role: user.role } });
    } catch (err: any) {
      console.error("[Server] Register error:", err);
      res.status(500).json({ error: err.message || "Failed to register user" });
    }
  });

  // Login user (returns JWT)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("[Server] Login attempt:", username);

      if (!username || !password) {
        console.log("[Server] Missing username or password");
        return res.status(400).json({ error: "Missing username or password" });
      }

      let user: any;
      if (useInMemoryAuth) {
        console.log("[Server] Using in-memory auth");
        // Use in-memory storage if MongoDB is unavailable
        user = await inMemoryAuthStorage.findUserByUsername(username);
      } else {
        console.log("[Server] Using MongoDB auth");
        // Try to use MongoDB
        user = await User.findOne({ username });
      }

      if (!user) {
        console.log("[Server] User not found:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        console.log("[Server] Invalid password for user:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({ id: user._id?.toString() || user.id, username: user.username, role: user.role });
      console.log("[Server] Login successful for user:", username);
      res.json({ success: true, token, user: { id: user._id || user.id, username: user.username, role: user.role } });
    } catch (err: any) {
      console.error("[Server] Login error:", err);
      res.status(500).json({ error: err.message || "Failed to login" });
    }
  });

  return httpServer;
}
