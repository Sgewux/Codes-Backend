import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";
import { checkAuth } from "../middlewares/auth.middlewares";
import checkSubmission from "../libs/checkSubmission";
import { SubmissionResult } from "../types/submissions";

const router = Router();

router.get("/submissions/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [result] = await callProcedure("get_submission_by_id", [id]);

    if (!result[0]) {
      res.status(400).json({ message: `No submission with id: ${id}` });
      return;
    }
    res.json(result[0]);

  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({ message: e.message });
  }
});

router.post("/submissions", checkAuth(["contestant"]), async (req: Request, res: Response): Promise<void> => {
  const { problem_id, code } = req.body;
  const handle = req.user?.handle;

  if (!problem_id || !code) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const [result] = await callProcedure("create_submission", [handle, problem_id, code]);
    const submissionId = result[0]?.submission_id;

    const [result1] = await callProcedure("get_problem_time_limit", [problem_id]);
    const time_limit = result1[0].time_limit_seconds;

    res.status(201).json({ message: "Submission created", submissionId });

    const verdict: SubmissionResult = await checkSubmission(submissionId, problem_id, code, time_limit);
    await callProcedure("update_submission_verdict", [submissionId, verdict.verdict, verdict.execution_time]);
  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({ message: e.message });
  }
});

export default router;
