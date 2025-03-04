import { Request, Response, Router } from "express";
import callProcedure from "../libs/callProcedure";
import { GetProblemsQuery } from "../types/problems";

const router = Router();

/**
 * Retrieves AC statistics for a given user.
 * 
 * @route GET /:handle/ac-statistics
 * @param {Request} req - Express request object (expects `handle` in params).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the AC statistics or an error message.
 */
router.get("/:handle/ac-statistics", async (req: Request, res: Response) => {
  const { handle } = req.params;

  try {
    const data = await callProcedure("get_AC_statistics", [handle]);
    const result = data[0]?.[0];

    if (!result) {
      res.status(404).json({ message: "User statistics not found" });
      return;
    }

    res.json({
      totalAC: result.TotalAC,
      recentAC: result.TotalRecentAC,
      totalSubmissions: result.TotalSubmissions,
    });
  } catch (e: any) {
    console.error("Error fetching AC statistics:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * Retrieves the count of submissions for a given user, filtered by status.
 * 
 * @route GET /:handle/submission-count
 * @param {Request} req - Express request object (expects `handle` in params, `filter` in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the submission count or an error message.
 */
router.get("/:handle/submission-count", async (req: Request, res: Response) => {
  const { handle } = req.params;
  const { filter } = req.query;

  if (filter !== "accepted" && filter !== "all" && filter !== "tried") {
    res.status(400).json({ message: "Invalid filter value" });
    return;
  }

  try {
    const data = await callProcedure("count_user_submissions", [handle, filter]);
    const count = data[0]?.[0]?.submission_count;

    if (count === undefined) {
      res.status(404).json({ message: "User or data not found" });
      return;
    }

    res.json({ submissionCount: count });
  } catch (e: any) {
    console.error("Error fetching submission count:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * Retrieves submissions for a given user with pagination and filtering.
 * 
 * @route GET /:handle/submissions
 * @param {Request} req - Express request object (expects `handle` in params, pagination and filter in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with user submissions or an error message.
 */
router.get(
  "/:handle/submissions",
  async (req: Request<any, any, any, GetProblemsQuery>, res: Response) => {
    const { pageLen, page, filter } = req.query;
    const { handle } = req.params;

    if (!pageLen || isNaN(pageLen) || !page || isNaN(page)) {
      res.status(400).json({ message: "Invalid pagination parameters" });
      return;
    }

    if (filter !== "accepted" && filter !== "all" && filter !== "tried") {
      res.status(400).json({ message: "Invalid filter value" });
      return;
    }

    try {
      const [usr] = await callProcedure("find_user_by_handle", [handle]);

      if (usr.length === 0) {
        res.status(404).json({ message: "Contestant not found" });
        return;
      }

      const [result] = await callProcedure("get_user_submissions", [
        handle,
        filter,
        pageLen,
        (page - 1) * pageLen,
      ]);

      res.json({ submissions: result });
    } catch (e: any) {
      console.error("Error fetching user submissions:", e);
      res.status(500).json({ message: e.message });
    }
  }
);

export default router;
