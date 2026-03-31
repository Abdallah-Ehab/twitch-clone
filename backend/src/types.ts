import { Request } from "express";
import type { IUser } from "./models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}