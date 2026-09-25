import "dotenv/config";
import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";

import {admin_router} from "./routes/adminRoutes";
import auth_router from "./routes/authRoutes";
import {business_router} from "./routes/businessRoutes";

import { getEvents } from "./controllers/businessControllers";

const app = express();

const PORT = Number(process.env.PORT || 8080);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Health
app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Public API: events

// Auth and Admin routers (mount)
app.use("/api/auth", auth_router as any);
app.use("/api/admin", admin_router as any);

// Fallback for businessRouter if it defines additional handlers
app.use("/api/business", business_router as any);

// Basic error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("Server error:", err);
  res.status(500).json({ error: err?.message || "Internal server error" });
});

const Host = "0.0.0.0";

app.listen(PORT, Host, () => {
  console.log(`Backend listening on port ${PORT} via app.listen`);
});

export default app;
