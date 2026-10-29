import express, { Application, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import albumRoutes from "./routes/albumRoutes";
import marketRoutes from "./routes/marketRoutes";
import tradeRoutes from "./routes/tradeRoutes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/trades", tradeRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "API World Cup is working ⚽" });
});

export default app;
