import { Router, Request, Response } from "express";
import {
  ContestantActivity,
  GetContestantsQuery,
  SearchContestantQuery,
} from "../types/contestants";
import callProcedure from "../libs/callProcedure";
import { checkAuth } from "../middlewares/auth.middlewares";

const router = Router();

/**
 * Fetches a contestant's submission activity within a specified date range.
 * 
 * @route GET /contestant/:handle/activity
 * @param {Request} req - Express request object (expects `handle` in params, `from` and `to` in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with an array of submission activity or an error message.
 */
router.get(
  "/contestant/:handle/activity",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { from, to } = req.query;
      const { handle } = req.params;

      // Validate if user exists
      const [usr] = await callProcedure("find_user_by_handle", [handle]);
      if (usr.length === 0) {
        res.status(404).json({ message: "Contestant not found" });
        return;
      }

      // Fetch submission activity
      const [result] = await callProcedure("get_submission_activity", [
        handle,
        from,
        to,
      ]);

      // Format date
      const format = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

      const resBody: Array<ContestantActivity> = result.map((r: any) => ({
        date: format(r["date"]),
        numberOfSubmissions: r["number_of_submissions"],
      }));

      res.json(resBody);
    } catch (e) {
      console.error("Error fetching activity:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Retrieves a paginated list of contestants based on filter criteria.
 * 
 * @route GET /contestants
 * @param {Request} req - Express request object (expects `pageLen`, `page`, `filter` in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a list of contestants or an error message.
 */
router.get(
  "/contestants",
  checkAuth(["contestant"]),
  async (req: Request, res: Response): Promise<void> => {
    const { pageLen, page, filter } = req.query;

    const parsedPageLen = Number(pageLen);
    const parsedPage = Number(page);
    const allowedFilters = ["all", "friends"];

    // Validate query parameters
    if (
      isNaN(parsedPageLen) ||
      isNaN(parsedPage) ||
      !allowedFilters.includes(filter as string)
    ) {
      res.status(400).json({ message: "Invalid query parameters" });
      return;
    }

    try {
      const [count, result] = await callProcedure("get_user_summary_for_user", [
        req.user?.handle,
        filter,
        parsedPageLen,
        (parsedPage - 1) * parsedPageLen,
      ]);

      res.json({
        numOfPages: Math.ceil(count[0].records / parsedPageLen),
        contestants: result,
      });
    } catch (e) {
      console.error("Error fetching contestants:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

/**
 * Searches for contestants by handle.
 * 
 * @route GET /contestants/search
 * @param {Request} req - Express request object (expects `pageLen`, `page`, `handle` in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a list of matching contestants or an error message.
 */
router.get(
  "/contestants/search",
  checkAuth(["contestant"]),
  async (req: Request, res: Response): Promise<void> => {
    const { pageLen, page, handle } = req.query;

    const parsedPageLen = Number(pageLen);
    const parsedPage = Number(page);

    if (!handle || isNaN(parsedPageLen) || isNaN(parsedPage)) {
      res.status(400).json({ message: "Invalid query parameters" });
      return;
    }

    try {
      const [count, result] = await callProcedure("get_user_summary_by_handle", [
        req.user?.handle,
        handle,
        parsedPageLen,
        (parsedPage - 1) * parsedPageLen,
      ]);

      res.json({
        numOfPages: Math.ceil(count[0].records / parsedPageLen),
        contestants: result,
      });
    } catch (e) {
      console.error("Error searching contestants:", e);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
