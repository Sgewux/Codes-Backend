import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import run from "./libs/run";
import { Execution } from "./types/execution";


const app = express();

dotenv.config();

app.use(
  cors({
    credentials: true,
    origin: process.env.MAIN_URL,
  })
);
app.use(express.json());

app.post("/run", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, code, input, time_limit } = req.body;
    const exec: Execution = await run(id, code, input, time_limit);

    if (typeof id !== "number" || typeof code !== "string" || typeof input !== "string" || typeof time_limit !== "number") {
      res.status(400).json({ error: "Invalid input parameters" });
      return;
    }
    res.status(200).json(exec);
  } catch (e: any) {
    console.error(e);
    res.status(500);
  }
});

export default app;
