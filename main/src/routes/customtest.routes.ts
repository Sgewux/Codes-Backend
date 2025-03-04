import { Request, Response, Router } from "express";
import { runCode } from "../libs/callRunnerService";

const router = Router();

/**
 * Executes a C++ code snippet with a given input and returns the result.
 * 
 * @route POST /customtest
 * @param {Request} req - Express request object (expects `code` and `input` in the request body).
 * @param {Object} req.body - The request body.
 * @param {string} req.body.code - The C++ source code to execute.
 * @param {string} req.body.input - The input string for the code execution.
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the execution result or an error message.
 */
router.post("/customtest", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, input }: any = req.body; // Extracts code and input from the request body

    // Calls the external runner service with predefined limits 15s timeout)
    const { data } = await runCode(100, code, input, 15);

    res.send(data);
  } catch (e: any) {
    console.error(e.message);
    res.status(500).json({ message: e.message }); 
  }
});

export default router;
