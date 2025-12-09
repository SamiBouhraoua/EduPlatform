import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
dotenv.config();

import { authMiddleware } from "./middleware/auth.js";
import adminRoutes from "./routes/admin.js";
import teacherRoutes from "./routes/teacher.js";
import studentRoutes from "./routes/student.js";


const app = express();
app.use(cors());

// LOG DES REQUÊTES
app.use((req, res, next) => {
  console.log("➡️ GATEWAY:", req.method, req.originalUrl);
  next();
});

const {
  PORT = 4000,
  JWT_SECRET = "dev_secret_change_me",
  AUTH_SERVICE_URL = "http://localhost:4001",
  ACADEMIC_SERVICE_URL = "http://localhost:4002",
  IA_SERVICE_URL = "http://localhost:4003",
} = process.env;

app.use(authMiddleware(JWT_SECRET));

// Admin / Teacher routes
const jsonParser = express.json();
app.use("/admin", jsonParser, adminRoutes({ AUTH_SERVICE_URL, ACADEMIC_SERVICE_URL }));
app.use("/teacher", jsonParser, teacherRoutes({ ACADEMIC_SERVICE_URL }));
app.use("/student", jsonParser, studentRoutes({ ACADEMIC_SERVICE_URL }));


// ***** ACADEMIC PROXY *****
app.use("/academic", proxy(ACADEMIC_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/academic${req.url}`,
  proxyReqOptDecorator: (opts, req) => {
    if (req.headers.authorization)
      opts.headers["authorization"] = req.headers.authorization;

    if (req.headers["x-college-id"])
      opts.headers["x-college-id"] = req.headers["x-college-id"];

    return opts;
  }
}));

// ***** IA PROXY *****
app.use(
  "/ia",
  proxy(IA_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/ia${req.url}`,
    proxyReqOptDecorator: (opts, req) => {
      opts.headers["authorization"] = req.headers.authorization || "";
      opts.headers["x-college-id"] = req.headers["x-college-id"] || "";
      opts.headers["content-type"] = "application/json";
      return opts;
    },
  })
);

// ***** CHAT AI PROXY *****
app.use(
  "/chat",
  proxy(process.env.CHATAI_SERVICE_URL || "http://chatai-service:5002", {
    proxyReqPathResolver: (req) => `/chat${req.url}`,
    proxyReqOptDecorator: (opts, req) => {
      opts.headers["authorization"] = req.headers.authorization || "";
      opts.headers["content-type"] = "application/json";
      return opts;
    },
  })
);


// ***** AUTH SERVICE *****
app.use("/", (req, res, next) => {
  console.log(`[Gateway] Forwarding ${req.method} ${req.url} to ${AUTH_SERVICE_URL}`);
  next();
}, proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => req.url,
  proxyErrorHandler: (err, res, next) => {
    console.error(`[Gateway] Proxy Error communicating with ${AUTH_SERVICE_URL}:`, err);
    res.status(500).json({ message: "Gateway Error: Service Unavailable", error: err.message });
  }
}));

app.listen(PORT, () => console.log(`🚀 API Gateway running on :${PORT}`));
