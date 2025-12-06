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
app.use(express.json());

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
app.use("/admin", adminRoutes({ AUTH_SERVICE_URL, ACADEMIC_SERVICE_URL }));
app.use("/teacher", teacherRoutes({ ACADEMIC_SERVICE_URL }));
app.use("/student", studentRoutes({ ACADEMIC_SERVICE_URL }));


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


// ***** AUTH SERVICE *****
app.use("/", proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => req.url
}));

app.listen(PORT, () => console.log(`🚀 API Gateway running on :${PORT}`));
