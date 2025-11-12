const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const linkRoutes = require("./routes/linkRoutes");
const statsRoutes = require("./routes/statsRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors("*"));
app.use(morgan("dev"));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/stats", statsRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
