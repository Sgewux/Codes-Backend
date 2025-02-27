import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";

const router = Router();

router.get("/submissions/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result, _] = await callProcedure("get_submission_by_id", [id]);
    
    if(result[0]){
      res.json(result[0]);
    } else {
      res.status(404).json({"message": `No submission with id: ${id}`});
    }

  } catch (e) {
    console.log(e);
    res.status(500).json();
  }
});

export default router;