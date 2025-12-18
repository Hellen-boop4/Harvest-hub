import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Farmer } from "./models/Farmer";
import { User } from "./models/User";
import { Milk } from "./models/Milk";
import { Loan } from "./models/Loan";
import { Counter } from "./models/Counter";
import { Product } from "./models/Product";
import { Account } from "./models/Account";
import { Payout } from "./models/Payout";
import { Notification } from "./models/Notification";
import { Server as IOServer } from "socket.io";
import { log } from "./vite";
import fs from "fs";
import path from "path";
import multer from "multer";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { sendSMS } from "./services/sms";
import { generateToken, verifyToken, verifyAdmin } from "./middleware/auth";
import jwt from "jsonwebtoken";
import { inMemoryAuthStorage } from "./auth-storage";

let useInMemoryAuth = false;

// socket.io instance (initialized later)
let io: any = undefined;

export function setUseInMemoryAuth(value: boolean) {
  useInMemoryAuth = value;
}

export function getUseInMemoryAuth() {
  return useInMemoryAuth;
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure upload directory exists
  const uploadsDir = path.join(process.cwd(), "server", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  // Multer setup for file uploads (photo & signature)
  const storageM = multer.diskStorage({
    destination: function (_req: any, _file: any, cb: any) {
      cb(null, uploadsDir);
    },
    filename: function (_req: any, file: any, cb: any) {
      const unique = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const ext = path.extname(file.originalname) || "";
      cb(null, `${file.fieldname}-${unique}${ext}`);
    },
  });
  const upload = multer({ storage: storageM });
  // API Routes

  // Register a new farmer (public endpoint) - accepts optional photo & signature uploads and NOK fields
  app.post("/api/farmers", upload.fields([{ name: "photo", maxCount: 1 }, { name: "signature", maxCount: 1 }]), async (req: any, res) => {
    try {
      console.log("POST /api/farmers called");
      console.log("Request body keys:", Object.keys(req.body || {}));
      console.log("Request files:", req.files ? Object.keys(req.files) : "none");
      // multer places text fields in req.body and files in req.files
      let { memberNo, firstName, middleName, surname, phone, email, idNumber, idType, city, county, address, dob, gender, maritalStatus, kraPIN, employerName, payrollStaffNo, memberCategory, status, nokName, nokRelationship, nokPhone, nokEmail } = req.body || {};

      // Validate required fields (memberNo optional - will be auto-generated)
      if (!firstName || !surname || !phone || !idNumber) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Auto-generate sequential formatted memberNo if not provided (fm0001, fm0002...)
      if (!memberNo) {
        const counter = await Counter.findOneAndUpdate(
          { _id: "farmer_memberNo" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        memberNo = `fm${String(counter.seq).padStart(4, "0")}`;
      }

      // Check if farmer already exists
      const existingFarmer = await Farmer.findOne({ idNumber });
      if (existingFarmer) {
        return res.status(409).json({ error: "Farmer with this ID number already exists" });
      }

      // Build farmer object including NOK and file paths
      const farmerData: any = {
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
        nokName,
        nokRelationship,
        nokPhone,
        nokEmail,
      };

      // Attach uploaded file paths
      const files = req.files || {};
      if (files.photo && files.photo[0]) farmerData.photoPath = `/uploads/${files.photo[0].filename}`;
      if (files.signature && files.signature[0]) farmerData.signaturePath = `/uploads/${files.signature[0].filename}`;

      // If request includes an Authorization token, record who captured this record
      const user = getUserFromHeader(req) || (req as any).user || null;
      if (user) {
        farmerData.capturedBy = user.id || user._id || user.id;
        farmerData.capturedAt = new Date();
      }

      const farmer = new Farmer(farmerData);

      await farmer.save();

      // Create default accounts for products with autoOpenAccount = true
      try {
        // If the client provided a list of productIds to create accounts for (stringified JSON from multipart FormData), honor it
        let createList: string[] | null = null;
        if (req.body?.createAccountsFor) {
          try {
            createList = typeof req.body.createAccountsFor === "string" ? JSON.parse(req.body.createAccountsFor) : req.body.createAccountsFor;
          } catch (e) {
            // ignore parse errors and fall back to creating for all auto-open products
            createList = null;
          }
        }

        let productsToOpen;
        if (Array.isArray(createList) && createList.length > 0) {
          productsToOpen = await Product.find({ autoOpenAccount: true, productId: { $in: createList } });
        } else {
          productsToOpen = await Product.find({ autoOpenAccount: true });
        }

        // parse optional per-account overrides from createAccountsData
        let createData: Record<string, any> | null = null;
        if (req.body?.createAccountsData) {
          try {
            createData = typeof req.body.createAccountsData === "string" ? JSON.parse(req.body.createAccountsData) : req.body.createAccountsData;
          } catch (e) {
            createData = null;
          }
        }

        for (const p of productsToOpen) {
          const accountNumber = `${farmer.memberNo}-${p.productId}`;
          const accountName = `${p.productName} - ${farmer.firstName} ${farmer.surname}`;
          const existing = await Account.findOne({ farmer: farmer._id, accountNumber });
          if (!existing) {
            const override = createData && createData[p.productId] ? createData[p.productId] : null;
            const acc = new Account({
              farmer: farmer._id,
              accountNumber,
              accountName,
              balance: override?.openingBalance ?? 0,
              type: p.productType || "Savings",
              status: "active",
              monthlyContribution: override?.monthlyContribution ?? p.monthlyContribution ?? p.expectedContribution ?? 0,
            });
            await acc.save();
          }
        }
      } catch (acctErr) {
        console.error("Failed to create default accounts:", acctErr);
      }

      // Create welcome notification
      try {
        const welcomeNotification = new Notification({
          farmer: farmer._id,
          type: "welcome",
          title: "Welcome to Harvest Hub",
          message: `Welcome ${farmer.firstName} ${farmer.surname}! Your account has been created successfully. You can now start recording milk collections and managing your accounts.`,
          metadata: { memberNo: farmer.memberNo }
        });
        await welcomeNotification.save();
        console.log("Welcome notification created for farmer:", farmer._id);

        // Send SMS welcome message
        if (farmer.phone) {
          const smsMessage = `Welcome to Harvest Hub ${farmer.firstName}! Your account (${farmer.memberNo}) is ready. Start recording milk collections today!`;
          try {
            const smsSent = await sendSMS(farmer.phone, smsMessage);
            if (smsSent) {
              console.log("Welcome SMS sent to:", farmer.phone);
            } else {
              console.log("Failed to send SMS, but notification created");
            }
          } catch (smsErr) {
            console.error("SMS sending error (non-critical):", smsErr);
          }
        }
      } catch (notifErr) {
        console.error("Failed to create welcome notification:", notifErr);
      }

      // Emit updated stats to connected clients (if socket.io initialized)
      try {
        const latestStats = await computeStats();
        if (io) {
          console.log("Emitting stats:update to broadcast new farmer");
          io.emit('stats:update', latestStats);
        } else {
          console.warn("Socket.io not initialized, unable to emit stats:update");
        }
      } catch (e) {
        console.error("Failed to emit stats after farmer creation:", e);
      }

      res.status(201).json({
        success: true,
        message: "Farmer registered successfully",
        farmer: farmer,
      });
    } catch (error: any) {
      console.error("Error registering farmer:", error);
      const errorMsg = typeof error === "string" ? error : (error?.message || "Unknown error");
      const errorStack = error?.stack || "";
      console.error("Error details:", { message: errorMsg, stack: errorStack });
      res.status(500).json({
        error: errorMsg || "Failed to register farmer",
        details: errorMsg,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined
      });
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
      const farmer = await Farmer.findById(req.params.id).populate("capturedBy", "username");
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
      // Remove memberNo from update data - it cannot be changed
      const updateData = { ...req.body };
      delete updateData.memberNo;
      delete updateData._id; // Also prevent _id changes
      
      const farmer = await Farmer.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!farmer) {
        return res.status(404).json({ error: "Farmer not found" });
      }
      
      // Emit update event
      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
        io?.emit?.("farmers:update", { farmer });
      } catch (e) {
        console.error("Failed to emit farmer update:", e);
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

  // Socket.io for real-time updates
  io = new IOServer(httpServer, { cors: { origin: "*" } });
  io.on("connection", (socket: any) => {
    log(`socket connected: ${socket.id}`, "socket");
    socket.on("disconnect", () => log(`socket disconnected: ${socket.id}`, "socket"));
  });

  // Helper to compute basic stats for the dashboard
  async function computeStats() {
    const farmersCount = await Farmer.countDocuments();

    const milkAgg = await Milk.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalMilkQuantity = milkAgg[0]?.totalQuantity ?? 0;
    const totalMilkAmount = milkAgg[0]?.totalAmount ?? 0;

    const loanAgg = await Loan.aggregate([
      {
        $group: {
          _id: null,
          totalDisbursed: { $sum: "$amount" },
          totalRepaid: { $sum: "$repaidAmount" },
          activeLoans: { $sum: { $cond: [{ $eq: ["$status", "disbursed"] }, 1, 0] } },
          overdueLoans: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] } },
        },
      },
    ]);

    const totalDisbursed = loanAgg[0]?.totalDisbursed ?? 0;
    const totalRepaid = loanAgg[0]?.totalRepaid ?? 0;
    const activeLoans = loanAgg[0]?.activeLoans ?? 0;
    const overdueLoans = loanAgg[0]?.overdueLoans ?? 0;

    return {
      farmersCount,
      milk: { totalQuantity: totalMilkQuantity, totalAmount: totalMilkAmount },
      loans: { totalDisbursed, totalRepaid, activeLoans, overdueLoans },
      accounts: { totalAccounts: await Account.countDocuments() },
    };
  }

  // Helper to decode optional JWT from Authorization header (non-fatal)
  function getUserFromHeader(req: any) {
    try {
      const auth = (req.headers?.authorization || req.headers?.Authorization) as string | undefined;
      if (!auth || !auth.startsWith("Bearer ")) return null;
      const token = auth.split(" ")[1];
      const secret = process.env.JWT_SECRET || "dev_secret_change_me";
      const decoded = jwt.verify(token, secret) as any;
      return { id: decoded.id, username: decoded.username, role: decoded.role };
    } catch (e) {
      return null;
    }
  }

  // POST milk collection (creates a milk record and emits stats update)
  app.post("/api/milk", verifyToken, async (req, res) => {
    try {
      const { farmerId, quantity, amount: rawAmount, date, fat, snf } = req.body;
      if (!farmerId || (quantity === undefined || quantity === null)) return res.status(400).json({ error: "Missing farmerId or quantity" });

      const farmer = await Farmer.findById(farmerId);
      if (!farmer) return res.status(404).json({ error: "Farmer not found" });

      // Compute amount if not provided using price per liter from env (fallback to 50 KES)
      const qty = Number(quantity) || 0;
      const pricePerLiter = Number(process.env.MILK_PRICE_PER_LITER) || 50;
      let amount = 0;
      if (rawAmount === undefined || rawAmount === null || rawAmount === "") {
        amount = Math.round(qty * pricePerLiter * 100) / 100;
      } else {
        amount = Number(rawAmount) || 0;
      }

      const milk = new Milk({ farmer: farmer._id, quantity: qty, amount, fat: Number(fat) || 0, snf: Number(snf) || 0, date: date || Date.now() });
      await milk.save();

      // Create milk collection notification
      try {
        const milkNotification = new Notification({
          farmer: farmer._id,
          type: "milk_collected",
          title: "Milk Collection Recorded",
          message: `${quantity} liters of milk collected on ${new Date(date || Date.now()).toLocaleDateString()}. Fat: ${fat || 0}%, SNF: ${snf || 0}%.`,
          metadata: { quantity, fat, snf, amount, date: date || Date.now() }
        });
        await milkNotification.save();

        // Send SMS notification
        if (farmer.phone) {
          const smsMessage = `${quantity}L milk collected. Fat: ${fat || 0}%, SNF: ${snf || 0}%. Keep up the good work!`;
          try {
            await sendSMS(farmer.phone, smsMessage);
          } catch (smsErr) {
            console.error("SMS sending error (non-critical):", smsErr);
          }
        }
      } catch (notifErr) {
        console.error("Failed to create milk notification:", notifErr);
      }

      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
      } catch (e) {
        console.error("Failed to emit stats after milk creation:", e);
      }

      res.status(201).json({ success: true, milk });
    } catch (err: any) {
      console.error("Error creating milk record:", err);
      res.status(500).json({ error: err.message || "Failed to create milk record" });
    }
  });

  // GET raw milk entries (detailed) - returns individual milk records populated with farmer
  app.get("/api/milk/entries", async (req, res) => {
    try {
      const { period } = req.query as any;

      let dateFilter: any = {};
      if (period && typeof period === "string") {
        const parts = period.split("-");
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        dateFilter = { date: { $gte: start, $lt: end } };
      }

      const filter = Object.keys(dateFilter).length ? dateFilter : {};
      const entries = await Milk.find(filter).populate("farmer").sort({ date: -1 });
      res.json({ success: true, results: entries });
    } catch (err: any) {
      console.error("Error fetching milk entries:", err);
      res.status(500).json({ error: err.message || "Failed to fetch milk entries" });
    }
  });

  // GET milk aggregates or farmer-specific totals
  app.get("/api/milk", async (req, res) => {
    try {
      const { farmerId, period } = req.query as any;

      const match: any = {};
      if (farmerId) {
        // Convert farmerId string to ObjectId for aggregation
        try {
          match.farmer = mongoose.Types.ObjectId.isValid(farmerId)
            ? new mongoose.Types.ObjectId(farmerId)
            : farmerId;
        } catch (e) {
          match.farmer = farmerId;
        }
      }

      let dateFilter: any = {};
      if (period && typeof period === "string") {
        // expected YYYY-MM
        const parts = period.split("-");
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        dateFilter = { date: { $gte: start, $lt: end } };
      }

      const filters = { ...(Object.keys(match).length ? match : {}), ...(Object.keys(dateFilter).length ? dateFilter : {}) };

      const agg = await Milk.aggregate([
        { $match: filters },
        { $group: { _id: "$farmer", totalQuantity: { $sum: "$quantity" }, totalAmount: { $sum: "$amount" }, totalFat: { $avg: "$fat" }, totalSnf: { $avg: "$snf" } } },
      ]);

      // If farmerId requested, return single object
      if (farmerId) {
        const item = agg[0] || { _id: farmerId, totalQuantity: 0, totalAmount: 0, totalFat: 0, totalSnf: 0 };
        return res.json({ success: true, farmerId: item._id, totalQuantity: item.totalQuantity || 0, totalAmount: item.totalAmount || 0, avgFat: item.totalFat || 0, avgSnf: item.totalSnf || 0 });
      }

      res.json({ success: true, results: agg });
    } catch (err: any) {
      console.error("Error fetching milk aggregates:", err);
      res.status(500).json({ error: err.message || "Failed to fetch milk records" });
    }
  });

  // GET loans (optionally by farmerId)
  app.get("/api/loans", async (req, res) => {
    try {
      const { farmerId } = req.query as any;
      const filter: any = {};
      if (farmerId) filter.farmer = farmerId;
      const loans = await Loan.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, loans });
    } catch (err: any) {
      console.error("Error fetching loans:", err);
      res.status(500).json({ error: err.message || "Failed to fetch loans" });
    }
  });

  // PATCH loan change (repayment mode/amount/start date)
  app.patch("/api/loans/:id/change", verifyToken, async (req, res) => {
    try {
      const { type, value } = req.body;
      const update: any = {};
      if (type === "repayment_amount") {
        update.repaymentAmountOverride = Number(value) || 0;
      } else if (type === "repayment_mode") {
        update.repaymentMode = value || "";
      } else if (type === "repayment_start") {
        update.repaymentStartDate = value ? new Date(value) : null;
      } else {
        return res.status(400).json({ error: "Invalid change type" });
      }

      const loan = await Loan.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!loan) return res.status(404).json({ error: "Loan not found" });
      res.json({ success: true, loan });
    } catch (err: any) {
      console.error("Error applying loan change:", err);
      res.status(500).json({ error: err.message || "Failed to apply loan change" });
    }
  });

  // POST loan issuance
  app.post("/api/loans", verifyToken, async (req, res) => {
    try {
      const { farmerId, productId, amount, interestRate, termMonths, notes, loanType } = req.body;
      if (!farmerId || !amount) return res.status(400).json({ error: "Missing farmerId or amount" });

      const farmer = await Farmer.findById(farmerId);
      if (!farmer) return res.status(404).json({ error: "Farmer not found" });

      // Generate sequential loan number ln0001, ln0002...
      let loanNo: string | null = null;
      try {
        const counter = await Counter.findOneAndUpdate(
          { _id: "loan_number" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const seq = counter?.seq || 1;
        loanNo = `ln${String(seq).padStart(4, "0")}`;
      } catch (e) {
        console.error("Failed to generate loan number:", e);
      }

      // If product is specified, get the charges from it
      let charges: any[] = [];
      let totalCharges = 0;
      if (productId) {
        const product = await Product.findById(productId);
        if (product && product.loanCharges) {
          charges = product.loanCharges.map((c: any) => ({
            chargeCode: c.chargeCode,
            description: c.description,
            chargeType: c.chargeType,
            amount: c.chargeType === "Fixed" ? c.amount : (amount * c.amount) / 100,
          }));
          totalCharges = charges.reduce((sum: number, c: any) => sum + c.amount, 0);
        }
      }

      const totalAmount = amount + totalCharges;
      const netDisbursed = Number(amount) - totalCharges;

      const loan = new Loan({
        loanNo,
        farmer: farmer._id,
        product: productId || undefined,
        loanType: loanType || "Term",
        amount,
        interestRate: interestRate || 0,
        termMonths: termMonths || 12,
        charges,
        totalCharges,
        totalAmount,
        netDisbursed,
        status: "applied",
        approvedBy: (req as any).user?._id,
      });

      await loan.save();

      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
      } catch (e) {
        console.error("Failed to emit stats after loan creation:", e);
      }

      res.status(201).json({ success: true, loan });
    } catch (err: any) {
      console.error("Error creating loan:", err);
      res.status(500).json({ error: err.message || "Failed to create loan" });
    }
  });

  // GET aggregated stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await computeStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      console.error("Error computing stats:", err);
      res.status(500).json({ error: err.message || "Failed to compute stats" });
    }
  });

  // GET accounts (optionally by farmerId)
  app.get("/api/accounts", async (req, res) => {
    try {
      const { farmerId } = req.query as any;
      const filter: any = {};
      if (farmerId) filter.farmer = farmerId;
      const accounts = await Account.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, accounts });
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      res.status(500).json({ error: err.message || "Failed to fetch accounts" });
    }
  });

  // GET notifications (optionally by farmerId, unread only if flag set)
  app.get("/api/notifications", verifyToken, async (req, res) => {
    try {
      const { farmerId, unreadOnly } = req.query as any;
      const filter: any = {};
      if (farmerId) filter.farmer = farmerId;
      if (unreadOnly === "true") filter.read = false;
      const notifications = await Notification.find(filter).populate("farmer", "firstName surname memberNo").sort({ createdAt: -1 });
      res.json({ success: true, results: notifications });
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ error: err.message || "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", verifyToken, async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: true, readAt: new Date() },
        { new: true }
      );
      if (!notification) return res.status(404).json({ error: "Notification not found" });
      res.json({ success: true, notification });
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      res.status(500).json({ error: err.message || "Failed to update notification" });
    }
  });

  // GET payouts preview for a given month (non-mutating)
  // Returns the same breakdown as process but without persisting changes
  app.get("/api/payouts/preview", async (req, res) => {
    try {
      const period = req.query.period as string;
      if (!period) {
        return res.status(400).json({ error: "Missing period (YYYY-MM) in query" });
      }

      const pricePerLiter = Number(req.query.rate ?? process.env.MILK_PRICE_PER_LITER ?? 50);

      const parts = period.split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);

      // build date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      // aggregate milk by farmer for the period
      const milkAgg = await Milk.aggregate([
        { $match: { date: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: "$farmer", totalQuantity: { $sum: "$quantity" }, totalAmount: { $sum: "$amount" } } },
      ]);

      const results: any[] = [];

      for (const m of milkAgg) {
        const farmerId = m._id;
        const totalQty = m.totalQuantity || 0;
        const gross = Math.round((totalQty * pricePerLiter) * 100) / 100; // compute using provided rate

        // sum monthly contributions from farmer's accounts
        const accounts = await Account.find({ farmer: farmerId });
        let totalContributions = 0;
        for (const acc of accounts) {
          const contr = acc.monthlyContribution || 0;
          if (contr > 0) {
            totalContributions += contr;
          }
        }

        // compute loan deductions (monthly installment or remaining balance)
        const loans = await Loan.find({ farmer: farmerId, status: "disbursed" });
        let totalLoanDeductions = 0;
        for (const loan of loans) {
          let installment = 0;
          if (loan.termMonths && loan.termMonths > 0) {
            installment = loan.amount / loan.termMonths;
          }
          const remaining = (loan.amount || 0) - (loan.repaidAmount || 0);
          const deduction = Math.min(installment, remaining);
          if (deduction > 0) {
            totalLoanDeductions += deduction;
          }
        }

        const netAmount = gross - totalLoanDeductions - totalContributions;

        results.push({
          farmerId,
          totalQty,
          gross,
          totalLoanDeductions: Math.round(totalLoanDeductions * 100) / 100,
          totalContributions: Math.round(totalContributions * 100) / 100,
          netAmount: Math.round(netAmount * 100) / 100,
          accounts: accounts.map((a: any) => ({
            accountNumber: a.accountNumber,
            accountName: a.accountName,
            monthlyContribution: a.monthlyContribution || 0,
            currentBalance: a.balance || 0,
          })),
          loans: loans.map((l: any) => ({
            _id: l._id,
            amount: l.amount,
            termMonths: l.termMonths,
            repaidAmount: l.repaidAmount || 0,
            monthlyInstallment: l.termMonths ? Math.round((l.amount / l.termMonths) * 100) / 100 : 0,
            remaining: Math.max(0, (l.amount || 0) - (l.repaidAmount || 0)),
          })),
        });
      }

      res.json({ success: true, period, results });
    } catch (err: any) {
      console.error("Error previewing payouts:", err);
      res.status(500).json({ error: err.message || "Failed to preview payouts" });
    }
  });

  // Process payouts for a given month (admin-protected)
  // Accepts either query `?period=YYYY-MM` or body { year, month }
  app.post("/api/payouts/process", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const period = (req.query.period as string) || req.body.period;
      let year: number, month: number;
      if (period) {
        const parts = period.split("-");
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
      } else if (req.body.year && req.body.month) {
        year = parseInt(req.body.year);
        month = parseInt(req.body.month);
      } else {
        return res.status(400).json({ error: "Missing period (YYYY-MM) or year/month in body" });
      }

      // build date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const pricePerLiter = Number((req.query.rate as string) ?? req.body?.rate ?? process.env.MILK_PRICE_PER_LITER ?? 50);

      // aggregate milk by farmer for the period
      const milkAgg = await Milk.aggregate([
        { $match: { date: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: "$farmer", totalQuantity: { $sum: "$quantity" }, totalAmount: { $sum: "$amount" } } },
      ]);

      const results: any[] = [];

      for (const m of milkAgg) {
        const farmerId = m._id;
        const totalQty = m.totalQuantity || 0;
        const totalAmount = Math.round((totalQty * pricePerLiter) * 100) / 100; // compute using provided rate

        // sum monthly contributions from farmer's accounts
        const accounts = await Account.find({ farmer: farmerId });
        let totalContributions = 0;
        for (const acc of accounts) {
          const contr = acc.monthlyContribution || 0;
          if (contr > 0) {
            totalContributions += contr;
            // credit the account by the contribution amount
            acc.balance = (acc.balance || 0) + contr;
            await acc.save();
          }
        }

        // compute loan deductions (monthly installment or remaining balance)
        const loans = await Loan.find({ farmer: farmerId, status: "disbursed" });
        let totalLoanDeductions = 0;
        for (const loan of loans) {
          let installment = 0;
          if (loan.termMonths && loan.termMonths > 0) {
            installment = loan.amount / loan.termMonths;
          }
          const remaining = (loan.amount || 0) - (loan.repaidAmount || 0);
          const deduction = Math.min(installment, remaining);
          if (deduction > 0) {
            // ensure loanType present to satisfy schema validation
            if (!loan.loanType) loan.loanType = "Term";
            loan.repaidAmount = (loan.repaidAmount || 0) + deduction;
            totalLoanDeductions += deduction;
            await loan.save();
          }
        }

        const netAmount = totalAmount - totalLoanDeductions - totalContributions;

        // create payout record
        const payout = new Payout({
          farmer: farmerId,
          period: `${year}-${String(month).padStart(2, "0")}`,
          totalMilkQuantity: totalQty,
          totalMilkAmount: totalAmount,
          totalLoanDeductions,
          totalContributions,
          netAmount,
          lines: [],
        });
        await payout.save();

        // Find or create a payout account for this farmer and credit it with netAmount
        try {
          let payoutAccount = await Account.findOne({ farmer: farmerId, type: "Payout" });
          if (!payoutAccount) {
            const farmer = await Farmer.findById(farmerId);
            payoutAccount = new Account({
              farmer: farmerId,
              accountNumber: `${farmer?.memberNo || farmerId}-PAYOUT`,
              accountName: `Payout Account - ${farmer?.firstName} ${farmer?.surname}`,
              balance: 0,
              type: "Payout",
              status: "active",
              currency: "KES"
            });
          }
          payoutAccount.balance = (payoutAccount.balance || 0) + netAmount;
          await payoutAccount.save();
        } catch (err) {
          console.error("Failed to credit payout account:", err);
        }

        // Create payout notification
        try {
          const farmer = await Farmer.findById(farmerId);
          const payoutNotification = new Notification({
            farmer: farmerId,
            type: "payout_processed",
            title: "Payout Processed",
            message: `Your payout for ${`${year}-${String(month).padStart(2, "0")}`} has been processed. Milk: KES ${totalAmount}, Deductions: KES ${totalLoanDeductions + totalContributions}, Net: KES ${netAmount}`,
            metadata: { totalQty, totalAmount, totalLoanDeductions, totalContributions, netAmount, period: `${year}-${String(month).padStart(2, "0")}` }
          });
          await payoutNotification.save();

          // Send SMS payout notification
          if (farmer && farmer.phone) {
            const smsPeriod = `${year}-${String(month).padStart(2, "0")}`;
            const smsMessage = `Payout for ${smsPeriod} processed! Earned: KES ${totalAmount}, Deductions: KES ${totalLoanDeductions + totalContributions}, Net: KES ${netAmount}. Check your account.`;
            try {
              await sendSMS(farmer.phone, smsMessage);
            } catch (smsErr) {
              console.error("SMS sending error (non-critical):", smsErr);
            }
          }
        } catch (notifErr) {
          console.error("Failed to create payout notification:", notifErr);
        }

        results.push({ farmerId, totalQty, totalAmount, totalLoanDeductions, totalContributions, netAmount, payoutId: payout._id });
      }

      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
        io?.emit?.("payouts:processed", { period: `${year}-${String(month).padStart(2, "0")}` });
      } catch (e) {
        console.error("Failed to emit stats after payout processing:", e);
      }

      res.json({ success: true, period: `${year}-${String(month).padStart(2, "0")}`, results });
    } catch (err: any) {
      console.error("Error processing payouts:", err);
      res.status(500).json({ error: err.message || "Failed to process payouts" });
    }
  });

  // GET payouts (optionally by period or farmer)
  app.get("/api/payouts", async (req, res) => {
    try {
      const { period, farmerId } = req.query as any;
      const filter: any = {};
      if (period) filter.period = period;
      if (farmerId) filter.farmer = farmerId;
      const payouts = await Payout.find(filter).populate("farmer").sort({ createdAt: -1 });
      res.json({ success: true, results: payouts });
    } catch (err: any) {
      console.error("Error fetching payouts:", err);
      res.status(500).json({ error: err.message || "Failed to fetch payouts" });
    }
  });

  // GET posted/disbursed loans
  app.get("/api/loans/posted", async (req, res) => {
    try {
      const filter: any = { status: "disbursed" };
      const loans = await Loan.find(filter).populate("farmer").sort({ createdAt: -1 });
      res.json({ success: true, results: loans });
    } catch (err: any) {
      console.error("Error fetching posted loans:", err);
      res.status(500).json({ error: err.message || "Failed to fetch posted loans" });
    }
  });

  // Create account
  app.post("/api/accounts", verifyToken, async (req, res) => {
    try {
      const { farmerId, accountNumber, accountName, balance, currency, type, status, lastTransaction } = req.body;
      if (!farmerId || !accountNumber || !accountName) return res.status(400).json({ error: "Missing required fields" });

      const farmer = await Farmer.findById(farmerId);
      if (!farmer) return res.status(404).json({ error: "Farmer not found" });

      const account = new Account({
        farmer: farmer._id,
        accountNumber,
        accountName,
        balance: balance || 0,
        currency: currency || "KES",
        type: type || "Savings",
        status: status || "active",
        lastTransaction,
        monthlyContribution: req.body.monthlyContribution || 0,
      });
      await account.save();

      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
        io?.emit?.("accounts:update", { account });
      } catch (e) {
        console.error("Failed to emit accounts update:", e);
      }

      res.status(201).json({ success: true, account });
    } catch (err: any) {
      console.error("Error creating account:", err);
      res.status(500).json({ error: err.message || "Failed to create account" });
    }
  });

  // --- Product setup endpoints ---
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await (await import("./models/Product")).Product.find().sort({ createdAt: -1 });
      res.json({ success: true, products });
    } catch (err: any) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: err.message || "Failed to fetch products" });
    }
  });

  // Get product by id
  app.get("/api/products/:id", async (req, res) => {
    try {
      const Product = (await import("./models/Product")).Product;
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ success: true, product });
    } catch (err: any) {
      console.error("Error fetching product:", err);
      res.status(500).json({ error: err.message || "Failed to fetch product" });
    }
  });

  // Create product (protected, admin only)
  app.post("/api/products", verifyAdmin, async (req, res) => {
    try {
      const payload = req.body;
      if (!payload.productId || !payload.productName || !payload.productType) {
        return res.status(400).json({ error: "Missing required product fields" });
      }
      const Product = (await import("./models/Product")).Product;
      const existing = await Product.findOne({ productId: payload.productId });
      if (existing) return res.status(409).json({ error: "ProductId already exists" });
      const product = new Product(payload);
      await product.save();
      io?.emit?.("products:update", { product });
      res.status(201).json({ success: true, product });
    } catch (err: any) {
      console.error("Error creating product:", err);
      res.status(500).json({ error: err.message || "Failed to create product" });
    }
  });

  // Update product (protected, admin only)
  app.put("/api/products/:id", verifyAdmin, async (req, res) => {
    try {
      const Product = (await import("./models/Product")).Product;
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) return res.status(404).json({ error: "Product not found" });
      io?.emit?.("products:update", { product });
      res.json({ success: true, product });
    } catch (err: any) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: err.message || "Failed to update product" });
    }
  });

  // Create an account from a product definition
  app.post("/api/products/:id/create-account", verifyToken, async (req, res) => {
    try {
      const Product = (await import("./models/Product")).Product;
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const { farmerId, accountNumber } = req.body;
      if (!farmerId) return res.status(400).json({ error: "Missing farmerId" });

      const farmer = await Farmer.findById(farmerId);
      if (!farmer) return res.status(404).json({ error: "Farmer not found" });

      const acctNo = accountNumber || `${product.productId}-${Date.now().toString().slice(-6)}`;
      const accountName = `${farmer.firstName} ${farmer.surname} - ${product.productName}`;

      const account = new Account({ farmer: farmer._id, accountNumber: acctNo, accountName, balance: 0, currency: "KES", type: product.productType === "Savings" ? "Savings" : "Loan", status: "active", lastTransaction: null });
      await account.save();

      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
        io?.emit?.("accounts:update", { account });
      } catch (e) {
        console.error("Failed to emit after create-account from product:", e);
      }

      res.status(201).json({ success: true, account });
    } catch (err: any) {
      console.error("Error creating account from product:", err);
      res.status(500).json({ error: err.message || "Failed to create account from product" });
    }
  });

  // GET settings (expose server-side settings to frontend)
  app.get("/api/settings", async (_req, res) => {
    try {
      const milkPricePerLiter = Number(process.env.MILK_PRICE_PER_LITER) || 50;
      res.json({ success: true, settings: { milkPricePerLiter } });
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ error: err.message || "Failed to fetch settings" });
    }
  });

  // Apply for a loan product (creates a loan application with status 'disbursed' - auto-approved)
  app.post("/api/products/:id/apply-loan", async (req, res) => {
    try {
      const Product = (await import("./models/Product")).Product;
      const LoanModel = (await import("./models/Loan")).Loan;
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      const { farmerId, amount, interestRate, termMonths } = req.body;
      if (!farmerId || !amount) return res.status(400).json({ error: "Missing farmerId or amount" });

      const farmer = await Farmer.findById(farmerId);
      if (!farmer) return res.status(404).json({ error: "Farmer not found" });

      // Compute loan charges from product definition (if any)
      let charges: any[] = [];
      let totalCharges = 0;
      if (Array.isArray(product.loanCharges) && product.loanCharges.length > 0) {
        charges = product.loanCharges.map((c: any) => ({
          chargeCode: c.chargeCode,
          description: c.description,
          chargeType: c.chargeType,
          amount: c.chargeType === "Fixed" ? c.amount : (amount * c.amount) / 100,
        }));
        totalCharges = charges.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
      }

      const totalAmount = Number(amount) + totalCharges; // total to repay
      const netDisbursed = Number(amount) - totalCharges; // amount actually disbursed after charges

      // Create a loan application with status 'disbursed' (auto-approved from product)
      const user = getUserFromHeader(req) || (req as any).user || null;

      // Generate sequential loan number ln0001, ln0002...
      let loanNo: string | null = null;
      try {
        const counter = await Counter.findOneAndUpdate(
          { _id: "loan_number" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        const seq = counter?.seq || 1;
        loanNo = `ln${String(seq).padStart(4, "0")}`;
      } catch (e) {
        console.error("Failed to generate loan number (product apply-loan):", e);
      }

      const loan = new LoanModel({
        loanNo,
        farmer: farmer._id,
        product: product._id,
        loanType: req.body.loanType || "Term",
        amount: Number(amount),
        interestRate: interestRate || product.defaultInterestRate || 0,
        termMonths: termMonths || product.defaultTermMonths || 0,
        charges,
        totalCharges,
        totalAmount,
        netDisbursed,
        status: "disbursed",
        approvedBy: user ? (user.id || user._id) : undefined,
      });

      await loan.save();

      // Optionally persist any custom charges provided in the request to the product definition
      if (req.body.saveChargesToProduct && Array.isArray(req.body.customCharges)) {
        try {
          product.loanCharges = product.loanCharges || [];
          for (const c of req.body.customCharges) {
            // basic validation
            if (c.chargeCode && c.description) product.loanCharges.push(c);
          }
          await product.save();
        } catch (e) {
          console.error("Failed to save custom charges to product:", e);
        }
      }

      try {
        const latestStats = await computeStats();
        io?.emit?.("stats:update", latestStats);
        io?.emit?.("loans:update", { loan });
      } catch (e) {
        console.error("Failed to emit after loan application:", e);
      }

      res.status(201).json({ success: true, loan });
    } catch (err: any) {
      console.error("Error applying for loan from product:", err);
      res.status(500).json({ error: err.message || "Failed to apply for loan from product" });
    }
  });

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

  // Promote user to admin (development helper - for demo environments only)
  app.post("/api/auth/promote-admin", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username required" });
      }

      console.log("[Server] Promoting user to admin:", username);

      let user: any;
      if (useInMemoryAuth) {
        user = await inMemoryAuthStorage.findUserByUsername(username);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        // For in-memory storage, we can't modify directly - only seed works
        return res.status(400).json({ error: "Cannot promote in-memory users. Use SEED_DEFAULT_ADMIN=true in .env" });
      } else {
        user = await User.findOneAndUpdate(
          { username },
          { role: "admin" },
          { new: true }
        );
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
      }

      console.log("[Server] User promoted to admin:", username);
      res.json({ success: true, user: { id: user._id || user.id, username: user.username, role: user.role } });
    } catch (err: any) {
      console.error("[Server] Promotion error:", err);
      res.status(500).json({ error: err.message || "Failed to promote user" });
    }
  });

  // Migration endpoint: renumber existing farmers to sequential fm0001 format
  app.post("/api/admin/migrate-membernos", verifyAdmin, async (req, res) => {
    try {
      const farmers = await Farmer.find().sort({ registeredAt: 1, _id: 1 });
      if (!farmers || farmers.length === 0) {
        return res.json({ success: true, migrated: 0 });
      }

      let index = 0;
      for (const f of farmers) {
        index += 1;
        const newNo = `fm${String(index).padStart(4, "0")}`;
        // update each farmer's memberNo
        await Farmer.findByIdAndUpdate(f._id, { memberNo: newNo });
      }

      // Update the counter to the latest index
      await Counter.findOneAndUpdate(
        { _id: "farmer_memberNo" },
        { $set: { seq: index } },
        { upsert: true }
      );

      res.json({ success: true, migrated: index });
    } catch (err: any) {
      console.error("Migration error:", err);
      res.status(500).json({ error: err.message || "Migration failed" });
    }
  });

  return httpServer;
}
