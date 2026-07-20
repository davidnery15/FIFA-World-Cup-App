import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import albumRoutes from "./routes/albumRoutes";
import marketRoutes from "./routes/marketRoutes";
import tradeRoutes from "./routes/tradeRoutes";

dotenv.config();

const app: Application = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/trades", tradeRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "API World Cup is working ⚽" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
