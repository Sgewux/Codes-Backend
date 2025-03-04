import { Request, Response, Router } from "express";
import callProcedure from "../libs/callProcedure";
import checkSubmission from "../libs/checkSubmission";
import { checkAuth } from "../middlewares/auth.middlewares";
import { SubmissionResult } from "../types/submissions";

const router = Router();

/**
 * Retrieves a submission by ID.
 * 
 * @route GET /submissions/:id
 * @param {Request} req - Express request object (expects `id` in params).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the submission details or an error message.
 */
router.get(
  "/submissions/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const [result] = await callProcedure("get_submission_by_id", [id]);

      if (!result[0]) {
        res.status(400).json({ message: `No submission with id: ${id}` });
        return;
      }

      res.json(result[0]);
    } catch (e: any) {
      console.error("Error fetching submission:", e.message);
      res.status(500).json({ message: e.message });
    }
  }
);

/**
 * Creates a new submission and evaluates it.
 * 
 * @route POST /submissions
 * @param {Request} req - Express request object (expects `problem_id` and `code` in body).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the submission ID and verdict.
 */
router.post(
  "/submissions",
  checkAuth(["contestant"]),
  async (req: Request, res: Response): Promise<void> => {
    const { problem_id, code } = req.body;
    const handle = req.user?.handle;

    if (!problem_id || !code) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    try {
      // Create submission in the database
      const [result] = await callProcedure("create_submission", [
        handle,
        problem_id,
        code,
      ]);
      const submissionId = result[0]?.submission_id;

      // Get problem's time limit
      const [result1] = await callProcedure("get_problem_time_limit", [
        problem_id,
      ]);
      const time_limit = result1[0]?.time_limit_seconds;

      res.status(201).json({ message: "Submission created", submissionId });

      // Evaluate submission asynchronously
      const verdict: SubmissionResult = await checkSubmission(
        submissionId,
        problem_id,
        code,
        time_limit
      );

      // Update the submission verdict
      await callProcedure("update_submission_verdict", [
        submissionId,
        verdict.verdict,
        verdict.execution_time,
      ]);
    } catch (e: any) {
      console.error("Error creating submission:", e.message);
      res.status(500).json({ message: e.message });
    }
  }
);

export default router;
