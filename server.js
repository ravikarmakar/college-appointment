import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// All Routes
import authRouter from "./routes/auth.route.js";
import professorRouter from "./routes/professor.route.js";
import studentRouter from "./routes/student.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Define routes
app.use("/api/auth", authRouter);
app.use("/api/professor", professorRouter);
app.use("/api/student", studentRouter);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to College Appointment System API" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

export default app;
