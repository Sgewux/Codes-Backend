import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import callProcedure from "../libs/callProcedure";
import { TokenData } from "../types/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { handle, password, first_name, last_name }: any = req.body;

  try {
    const hashed_password: string = await bcrypt.hash(password, 10);

    await callProcedure(
      "register",
      [
        handle,
        first_name,
        last_name,
        hashed_password
      ]
    );

    const payload: TokenData = {
      handle: handle,
      role: "contestant",
    };

    const token: string = jwt.sign(
      payload,
      process.env.TOKEN_SECRET || "something",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "none",
    });
    res.json({
      handle: handle,
      role: "user",
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { handle, password }: any = req.body;

  try {
    const [result]: RowDataPacket[] = await callProcedure(
      "find_user_by_handle",
      [handle]
    );
    const user = result[0];
    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    const payload: TokenData = {
      handle: handle,
      role: "contestant"
    };

    const token: string = jwt.sign(
      payload,
      process.env.TOKEN_SECRET || "something",
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: false,
      secure: false,
      sameSite: "none",
    });
    res.json({
      handle: handle,
      role: "user",
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  res.sendStatus(200);
});

export default router;
