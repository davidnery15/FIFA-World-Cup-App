import { Router } from "express";
import { getPerfectMatches, getMarketFeed } from "../controllers/marketController";
import { protect } from "../middlewares/protect";

const router = Router();

router.use(protect);

// Endpoint: GET /api/market/matches (The algorithm that finds who has what we lack)
router.get("/matches", getPerfectMatches);

// Endpoint: GET /api/market/feed (General community feed)
router.get("/feed", getMarketFeed);

export default router;
