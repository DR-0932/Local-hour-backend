import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";

import { admin_router } from "./routes/adminRoutes";
import auth_router from "./routes/authRoutes";
import { business_router } from "./routes/businessRoutes";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", auth_router);
app.use("/api/admin", admin_router);
app.use("/api/business", business_router);

app.use(
  (err: any, _req: Request, res: Response, _next: any) => {
    console.error("Server error:", err);

    res.status(500).json({
      error: err?.message || "Internal server error",
    });
  }
);

export default app;