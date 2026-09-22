import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { prisma } from "./db/prisma.js";
import authRoutes from "./routes/auth.route.js";
import studentRoutes from "./routes/student.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8443",
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 3000;

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Catechism Management API is running!",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
app.use("/api/users", userRoutes);
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
