import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dataBase } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import requestRoutes from "./src/routes/requestRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL, 
    "http://localhost:5173",
    "http://localhost:5175",
    "https://final-frontend-three-peach.vercel.app"
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const startServer = async () => {
  try {
    await dataBase();

    app.use("/api/auth", authRoutes);
    app.use("/api/requests", requestRoutes);

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: "Internal Server Error" });
    });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
