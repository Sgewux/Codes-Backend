import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";
import { GetProblemsQuery } from "../types/problems";

const router = Router();

/**
 * - Calls the stored procedure `get_AC_statistics` with the provided handle.
 * - Returns a JSON response containing:
 *   - `totalAC`: Total number of distinct problems solved.
 *   - `recentAC`: Number of problems solved in the last 30 days.
 *   - `totalSubmissions`: Total number of submissions made.
 */

router.get("/:handle/ac-statistics", async (req: Request, res: Response) => {
  const { handle } = req.params;

  try {
    const data = await callProcedure("get_AC_statistics", [handle]);
    const result = data[0][0];

    res.json({
      totalAC: result.TotalAC,
      recentAC: result.TotalRecentAC,
      totalSubmissions: result.TotalSubmissions,
    });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

router.get("/:handle/submission-count", async (req: Request, res: Response) => {
  const { handle } = req.params;
  const { filter } = req.query; 

  if (handle && (filter === "accepted" || filter === "all" || filter === "tried")){
    try {
      const data = await callProcedure("count_user_submissions", [handle, filter]);
      const count = data[0][0].submission_count; 
 
      res.json({ submissionCount: count });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({ message: e.message });
    }
  }

});



router.get("/:handle/submissions", async (req: Request<any, any, any, GetProblemsQuery>, res: Response) => {
  const { pageLen, page, filter } = req.query;
  const { handle } = req.params;
  
  if (handle && pageLen && !isNaN(pageLen) && page && !isNaN(page) &&
    (filter === "accepted" || filter === "all" || filter === "tried")
  ) {
    try {
      const [result, _] = await callProcedure("get_user_submissions", [ handle, filter, pageLen, (page - 1) * pageLen ]);

      let resBody = { submissions: result };

      res.json(resBody);
    } catch (e) {
      console.log(e);
      res.status(500).json();
    }
  } else {
    res.status(400).json();
  }
});

export default router;
