import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import callProcedure from "../libs/callProcedure";
import { TokenData } from "../types/auth";

const router = Router();

/**
 * Registers a new user.
 * 
 * - Checks if the handle is already in use.
 * - Hashes the password before storing it.
 * - Saves the user in the database.
 * - Generates a JWT token and sets it as a cookie.
 * 
 * @route POST /auth/register
 * @param {Request} req - Express request object (expects handle, password, first_name, last_name in body).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the registered user's handle or an error message.
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { handle, password, first_name, last_name }: any = req.body;

    // Check if the handle is already taken
    const [result]: RowDataPacket[] = await callProcedure(
      "find_user_by_handle",
      [handle]
    );

    if (result.length !== 0) {
      res.status(400).json({ message: "The handle is already in use" });
      return;
    }

    // Hash password and register the user
    const hashed_password: string = await bcrypt.hash(password, 10);

    await callProcedure("register_contestant", [
      handle,
      first_name,
      last_name,
      hashed_password,
    ]);

    // Generate authentication token
    const payload: TokenData = {
      handle: handle,
      roles: ["contestant"],
    };

    const token: string = jwt.sign(
      payload,
      process.env.TOKEN_SECRET || "secret",
      { expiresIn: "1d" }
    );

    // Set authentication token in cookies
    res.cookie("token", token);
    res.json({ handle: handle });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * Logs in an existing user.
 * 
 * - Verifies if the user exists.
 * - Compares the entered password with the stored hash.
 * - Retrieves the user's roles.
 * - Generates a JWT token and sets it as a cookie.
 * 
 * @route POST /auth/login
 * @param {Request} req - Express request object (expects handle and password in body).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the user's handle or an error message.
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { handle, password }: any = req.body;

    // Check if the user exists
    const [result]: RowDataPacket[] = await callProcedure(
      "find_user_by_handle",
      [handle]
    );

    if (result.length === 0) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    const user = result[0];

    // Verify password
    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    // Retrieve user roles
    const [roles]: RowDataPacket[] = await callProcedure("get_user_roles", [
      handle,
    ]);

    // Generate authentication token
    const payload: TokenData = {
      handle: handle,
      roles: roles.map((r: { role_name: string }) => r.role_name),
    };

    const token: string = jwt.sign(
      payload,
      process.env.TOKEN_SECRET || "secret",
      { expiresIn: "1d" }
    );

    // Set authentication token in cookies
    res.cookie("token", token);
    res.json({ handle: handle });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * Verifies if the user is authenticated.
 * 
 * - Checks if the JWT token exists.
 * - Decodes the token and returns the user's data.
 * 
 * @route GET /auth/verify
 * @param {Request} req - Express request object (expects token in cookies).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with user data or an error message.
 */
router.get("/verify", async (req: Request, res: Response): Promise<void> => {
  const token: string | undefined = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET || "secret",
    (e: jwt.VerifyErrors | null, decoded: any) => {
      if (e) {
        res.status(401).json({ message: e.message });
        return;
      }

      const user: TokenData = decoded as TokenData;
      res.json(user);
    }
  );
});

/**
 * Logs out the user by clearing the authentication token.
 * 
 * - Removes the token cookie.
 * 
 * @route POST /auth/logout
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void} Responds with status 200.
 */
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  res.sendStatus(200);
});

export default router;
