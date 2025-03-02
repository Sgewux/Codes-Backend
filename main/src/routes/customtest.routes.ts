import { Request, Response, Router } from "express";
import { runCode } from "../libs/callRunnerService";

const router = Router();

router.post("/customtest", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, input }: any = req.body;
    const { data } = await runCode(100, code, input, 15);
    
    res.send(data);
  } catch (e: any) {
    console.error(e.message);
    res.status(500).json({ message: e.message });
  }
});

export default router;
