import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { RegisterInput, LoginInput } from "../schemas/authSchema";

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || "super_secret_development_key";
  return jwt.sign({ id }, secret, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request<{}, {}, RegisterInput>, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists with this email." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      collectedStickers: [],
      duplicateStickers: [],
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        collectedStickers: user.collectedStickers,
        duplicateStickers: user.duplicateStickers,
        token: generateToken(user._id as string),
      });
    } else {
      res.status(400).json({ message: "Invalid user data received." });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request<{}, {}, LoginInput>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        collectedStickers: user.collectedStickers,
        duplicateStickers: user.duplicateStickers,
        token: generateToken(user._id as string),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error.", error });
  }
};
