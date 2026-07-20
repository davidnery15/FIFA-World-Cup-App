import { Router } from "express";
import { createTrade, getMyTrades, respondToTrade } from "../controllers/tradeController";
import { protect } from "../middlewares/protect";
import { validate } from "../middlewares/validate";
import { createTradeSchema, respondTradeSchema } from "../schemas/tradeSchema";

const router = Router();

router.use(protect);

// Endpoint: GET /api/trades (History of sent and received trades)
router.get("/", getMyTrades);

// Endpoint: POST /api/trades (Create a new trade proposal)
router.post("/", validate(createTradeSchema), createTrade);

// Endpoint: PATCH /api/trades/:id (Accept, reject, or cancel a trade)
router.patch("/:id", validate(respondTradeSchema), respondToTrade);

export default router;
