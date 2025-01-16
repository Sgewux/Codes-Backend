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

    res.json(exec);
    res.status(200);
  } catch (e: any){
    console.log(e);
    res.status(500);
  }
});

export default app;
