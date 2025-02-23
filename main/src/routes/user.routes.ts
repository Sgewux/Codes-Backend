import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";

const router = Router();

/**
 * Express router to handle requests related to AC statistics.
 *
 * - Defines an endpoint to fetch AC statistics for a given user handle.
 * - Calls the stored procedure `get_AC_statistics` with the provided handle.
 * - Returns a JSON response containing:
 *   - `totalAC`: Total number of distinct problems solved.
 *   - `recentAC`: Number of problems solved in the last 30 days.
 *   - `totalSubmissions`: Total number of submissions made.
 * - Handles errors and sends an appropriate response if the request fails.
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

export default router;
