import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../types";

interface DecodedToken extends JwtPayload {
  id: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const secret = process.env.JWT_SECRET || "super_secret_development_key";
      const decoded = jwt.verify(token, secret) as DecodedToken;

      const currentUser = await User.findById(decoded.id).select("-passwordHash");

      if (!currentUser) {
        res.status(401).json({ message: "Not authorized. The user belonging to this token no longer exists." });
        return;
      }

      req.user = currentUser;

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      res.status(401).json({ message: "Not authorized. Token failed verification or has expired." });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized. No access token provided in headers." });
    return;
  }
};
