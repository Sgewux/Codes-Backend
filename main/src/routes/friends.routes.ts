import { Request, Response, Router } from "express";
import callProcedure from "../libs/callProcedure";
import { checkAuth } from "../middlewares/auth.middlewares";

const router = Router();

/**
 * Creates a friendship between the authenticated user and another contestant.
 * 
 * @route POST /friend/
 * @param {Request} req - Express request object (expects `friendHandle` in the request body).
 * @param {Object} req.body - The request body.
 * @param {string} req.body.friendHandle - The handle of the friend to add.
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a success message or an error message.
 */
router.post(
  "/friend/",
  checkAuth(["contestant"]),
  async (req: Request, res: Response): Promise<void> => {
    const { friendHandle } = req.body;
    const handle = req.user?.handle;

    if (!handle || !friendHandle) {
      res
        .status(400)
        .json({ message: "Both handle and friend_handle are required." });
      return;
    }

    try {
      await callProcedure("create_friend", [handle, friendHandle]);
      res
        .status(201)
        .json({ success: true, message: "Friendship created successfully." });
    } catch (e: any) {
      console.error("Error creating friendship:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

/**
 * Deletes a friendship between the authenticated user and another contestant.
 * 
 * @route DELETE /friend/
 * @param {Request} req - Express request object (expects `friendHandle` in the request body).
 * @param {Object} req.body - The request body.
 * @param {string} req.body.friendHandle - The handle of the friend to remove.
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a success message or an error message.
 */
router.delete(
  "/friend/",
  checkAuth(["contestant"]),
  async (req: Request, res: Response): Promise<void> => {
    const { friendHandle } = req.body;
    const handle = req.user?.handle;

    if (!handle || !friendHandle) {
      res
        .status(400)
        .json({ message: "Both handle and friend_handle are required." });
      return;
    }

    try {
      await callProcedure("delete_friend", [handle, friendHandle]);
      res
        .status(200)
        .json({ success: true, message: "Friendship deleted successfully." });
    } catch (e: any) {
      console.error("Error deleting friendship:", e);
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

export default router;
