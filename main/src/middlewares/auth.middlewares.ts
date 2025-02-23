import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role, TokenData } from "../types/auth";

const checkAuth = (requiredRoles: Role[] = []) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies.token;

      if (!token) {
        res.status(401).json({ message: "No token, authorization denied" });
        return;
      }

      jwt.verify(token, process.env.TOKEN_SECRET || "secret", (e: any, decoded: any) => {
        if (e) {
          res.status(401).json({ message: e.message });
          return;
        }

        const user: TokenData = {
          handle: decoded.handle,
          roles: decoded.roles
        };

        if (!user.roles.includes("admin")) {
          if (requiredRoles.length > 0 && !user.roles.some(role => requiredRoles.includes(role))) {
            res.status(403).json({ message: "Forbidden: Insufficient permissions" });
            return;
          }
        }

        req.user = user;
        next();
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };
};

export { checkAuth };
