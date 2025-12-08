const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const statsRoutes = require("./routes/statsRoutes");
const errorHandler = require("./middlewares/errorHandler");
const domainRoutes = require("./routes/domainRoutes");
const app = express();

// Enhanced CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://doiniknews.xyz",
      "https://tracker.arcyntech.com",
      "https://tracker.cleanpc.xyz",
      "https://ipapi.co",
      "https://cleanpc.xyz",
      "https://protidinernews.xyz",
      "https://api.cleanpc.xyz",
      "https://trackops.online",
      "https://sports.doiniknews.xyz",
      "https://foreign.doiniknews.xyz",
      "https://local.doiniknews.xyz",
      "https://national.doiniknews.xyz",
      "https://daily.doiniknews.xyz",
      "https://entertainment.doiniknews.xyz",
      "https://crime.doiniknews.xyz",
      "https://humanrights.doiniknews.xyz",

      /^https:\/\/.*\.arcyntech\.com$/, // Regex for all subdomains
      /^https:\/\/.*\.cleanpc\.xyz$/,
    ].filter(Boolean); // Remove any undefined values

    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === "development") {
      // In development, you might want to be more permissive
      console.warn(
        `CORS warning: Origin ${origin} not in allowed list, but allowing in development mode`
      );
      callback(null, true);
    } else {
      // In production, be strict
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true, // Important for cookies, authorization headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-auth-token",
    "Accept",
    "Origin",
    "Access-Control-Allow-Headers",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: [
    "Content-Length",
    "Content-Type",
    "Authorization",
    "x-auth-token",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours in seconds
};

app.use(cors(corsOptions));

// 2. Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// 3. Other security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),
      },
    },
  })
);

// 4. Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// 5. Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route (outside rate limiting)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    cors: {
      enabled: true,
      allowedOrigins: corsOptions.origin.toString(),
    },
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/domains", domainRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware - must be last
app.use(errorHandler);

module.exports = app;
