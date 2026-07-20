import { Request } from "express";
import { IUser } from "../models/User";

// Explicitly extend Express Request to include our authenticated User document
export interface AuthRequest<P = {}, ResBody = {}, ReqBody = {}, ReqQuery = {}> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: IUser;
}
