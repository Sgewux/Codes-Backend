import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";

const router = Router();

router.post("/problems", async (req: Request, res: Response) => {
  const { name, statement, editorial, time_limit_seconds, memory_limit_mb, problemsetter_handle, input, output } = req.body;

  if (!name || !statement || !editorial || !time_limit_seconds || !memory_limit_mb || !problemsetter_handle || !input || !output) {
    res.status(400).json({ message: "There is not enough data to create the problem." });
  }

  try {
    await callProcedure("sp_create_problem", [name, statement, editorial, time_limit_seconds, memory_limit_mb, problemsetter_handle, input, output]);
    res.status(201).json({ message: "OK" });
  } catch (e: any) {
    console.error("Error creating the problem:", e);
    res.status(500).json({ message: e.message });
  }
});


router.get("/:handle/read-problem", async (req: Request, res: Response) => {
  const { handle } = req.params;
  try {
    const data = await callProcedure("sp_read_problem_by_handle", [handle]);

    const problems = data[0];

    res.json({ problems });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put("/update-problem/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { statement, editorial } = req.body;

  if (!statement && !editorial) {
    res.status(400).json({ success: false, message: "There are no pending changes" });
  }

  try {
    await callProcedure("sp_update_problem", [id, statement, editorial]);

    res.json({ success: true, message: "OK" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});


router.delete("/delete-problem/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await callProcedure("sp_delete_problem", [Number(id)]);
    res.json({ success: true, message: "OK" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});


export default router;