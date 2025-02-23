import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import callProcedure from "../libs/callProcedure";
import { TokenData } from "../types/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { handle, password, first_name, last_name }: any = req.body;
    const [result]: RowDataPacket[] = await callProcedure(
      "find_user_by_handle",
      [handle]
    );

    if (result.length !== 0) {
      res.status(400).json({ message: "The handle is already in use" });
      return;
    }

    const hashed_password: string = await bcrypt.hash(password, 10);

    await callProcedure(
      "register_contestant",
      [
        handle,
        first_name,
        last_name,
        hashed_password
      ]
    );

    const payload: TokenData = {
      handle: handle,
      roles: ["contestant"]
    };

    const token: string = jwt.sign(
      payload,
      process.env.TOKEN_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.cookie("token", token);
    res.json({ handle: handle });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { handle, password }: any = req.body;
    const [result]: RowDataPacket[] = await callProcedure(
      "find_user_by_handle",
      [handle]
    );

    if (result.length === 0) {
      res.status(400).json({ message: "User does not exist" });
      return;
    }

    const user = result[0];
    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const [roles]: RowDataPacket[] = await callProcedure(
      "get_user_roles",
      [handle]
    );

    const payload: TokenData = {
      handle: handle,
      roles: roles.map((r: { role_name: string }) => r.role_name)
    };

    const token: string = jwt.sign(
      payload,
      process.env.TOKEN_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.cookie("token", token);
    res.json({ handle: handle });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/verify", async (req: Request, res: Response): Promise<void> => {
  const token: string | undefined = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "No token, authorization denied" });
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET || "secret", (e: any, decoded: any) => {
    if (e) {
      res.status(401).json({ message: e.message });
      return;
    }

    const user: TokenData = decoded as TokenData;
    res.json(user);
  });
});

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  res.sendStatus(200);
});

export default router;
