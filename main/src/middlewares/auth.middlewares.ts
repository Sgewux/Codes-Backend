import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TokenData } from "../types/auth";

const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token: string | null = req.cookies.token;

  try {
    if (!token) {
      res.status(401).json({ message: "No token, authorization denied" });
      return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET || "secret", async (e: any, decoded: any): Promise<void> => {
      if (e) {
        res.status(401).json({ message: e.message });
        return;
      }

      const user: TokenData = {
        handle: decoded.handle,
        role: "contestant"
      };

      req.user = user;
      next(); 
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export { checkAuth };
