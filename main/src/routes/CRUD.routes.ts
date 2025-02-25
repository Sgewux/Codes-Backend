import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";

const router = Router();

router.post("/problems", async (req: Request, res: Response) => {
  const { name,statement,editorial,time_limit_seconds,memory_limit_mb,problemsetter_handle,input,output} = req.body;
  
  if (!name || !statement || !editorial || !time_limit_seconds || !memory_limit_mb || !problemsetter_handle || !input || !output) {
    res.status(400).json({ message: "There is not enough data to create the problem." });
  }
  
  try {
    await callProcedure("sp_create_problem", [name,statement,editorial,time_limit_seconds,memory_limit_mb,problemsetter_handle,input,output]);
    res.status(201).json({ message: "ok" });
  } catch (e: any) {
    console.error("Error creating the problem:", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;