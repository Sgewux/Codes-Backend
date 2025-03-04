import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role, TokenData } from "../types/auth";

/**
 * Middleware to check user authentication and role-based authorization.
 * 
 * This function:
 * - Extracts the JWT token from cookies.
 * - Verifies the token and decodes user information.
 * - Checks if the user has the required roles.
 * - Calls `next()` if authorized, otherwise responds with an error.
 * 
 * @param {Role[]} [requiredRoles=[]] - An array of roles required to access the endpoint.
 * @returns {Function} Express middleware function.
 */
const checkAuth = (requiredRoles: Role[] = []) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Retrieve token from cookies
      const token = req.cookies.token;

      if (!token) {
        res.status(401).json({ message: "No token, authorization denied" });
        return;
      }

      // Verify the token
      jwt.verify(
        token,
        process.env.TOKEN_SECRET || "secret",
        (e: jwt.VerifyErrors | null, decoded: any) => {
          if (e) {
            res.status(401).json({ message: e.message });
            return;
          }

          const user: TokenData = {
            handle: decoded.handle,
            roles: decoded.roles,
          };

          // Check if the user has sufficient permissions
          if (!user.roles.includes("admin")) {
            const hasRequiredRole = requiredRoles.length === 0 || 
              user.roles.some((role) => requiredRoles.includes(role));

            if (!hasRequiredRole) {
              res
                .status(403)
                .json({ message: "Forbidden: Insufficient permissions" });
              return;
            }
          }

          // Attach user data to the request object
          req.user = user;
          next();
        }
      );
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };
};

export { checkAuth };
