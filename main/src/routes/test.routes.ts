import { Request, Response, Router } from "express";
import { checkAuth } from "../middlewares/auth.middlewares";

const router = Router();

router.get("/test-protected", checkAuth(["contestant"]), async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: "Hello, World!" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

router.get("/test", async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: "Hello, World!" });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
