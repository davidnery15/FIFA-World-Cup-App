import { Router } from "express";
import { getMyAlbum, addCollectedSticker, addDuplicateSticker, removeDuplicateSticker } from "../controllers/albumController";
import { protect } from "../middlewares/protect";
import { validate } from "../middlewares/validate";
import { stickerCodeSchema } from "../schemas/albumSchema";

const router = Router();

router.use(protect);

// Endpoint: GET /api/album/me
router.get("/me", getMyAlbum);

// Endpoint: POST /api/album/collect
router.post("/collect", validate(stickerCodeSchema), addCollectedSticker);

// Endpoint: POST /api/album/duplicate
router.post("/duplicate", validate(stickerCodeSchema), addDuplicateSticker);

// Endpoint: DELETE /api/album/duplicate
router.delete("/duplicate", validate(stickerCodeSchema), removeDuplicateSticker);

export default router;
