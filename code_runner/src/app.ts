import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import run from "./libs/run";
import { Execution } from "./types/execution";

const app = express();

dotenv.config();

/**
 * Configures middleware for the Express application.
 * 
 * - Enables CORS with credentials support.
 * - Allows requests from the origin specified in `MAIN_URL`.
 */
app.use(
  cors({
    credentials: true,
    origin: process.env.MAIN_URL,
  })
);
app.use(express.json());

/**
 * Executes a C++ code snippet with a given input and returns the result.
 * 
 * @route POST /run
 * @param {Request} req - Express request object.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.id - Unique identifier for the execution.
 * @param {string} req.body.code - The C++ source code to execute.
 * @param {string} req.body.input - The input string for the code execution.
 * @param {number} req.body.time_limit - Maximum execution time in seconds.
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the execution result or an error message.
 */
app.post("/run", async (req: Request, res: Response): Promise<void> => {
  const { id, code, input, time_limit } = req.body;

  if (
    typeof id !== "number" ||
    typeof code !== "string" ||
    typeof input !== "string" ||
    typeof time_limit !== "number"
  ) {
    res.status(400).json({ error: "Invalid input parameters" });
    return;
  }

  try {
    const exec: Execution = await run(id, code, input, time_limit);
    res.status(200).json(exec);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
