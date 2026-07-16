import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../schemas/authSchema";

const router = Router();

// Endpoint: POST /api/auth/register (Protected by Zod validation)
router.post("/register", validate(registerSchema), registerUser);

// Endpoint: POST /api/auth/login (Protected by Zod validation)
router.post("/login", validate(loginSchema), loginUser);

export default router;
