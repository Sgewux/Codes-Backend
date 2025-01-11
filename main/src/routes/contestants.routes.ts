import { Router, Request, Response } from "express";
import { ContestantActivity } from "../types/contestants";
import callProcedure from "../libs/callProcedure";

const router = Router();

router.get("/contestant/:handle/activity", async (req:Request, res:Response ): Promise<void> => {
  const { from, to } = req.query;
  const [result, _] = await callProcedure("query_submission_activity", [req.params.handle, from, to]);
  let resBody: Array<ContestantActivity> =[];

  const format = (d: Date) => {
    const month = (d.getMonth() + 1) >= 10 ? `${(d.getMonth() + 1)}` : `0${d.getMonth() + 1}`;
    const day = (d.getDate() + 1) >= 10 ? `${(d.getDate())}` : `0${d.getDate()}`;

    return `${d.getFullYear()}-${month}-${day}`;
  }

  result.forEach((r:any) => resBody.push( {date: format(r["date"]), numberOfSubmissions: r["number_of_submissions"]} ));

  res.json(resBody);
  
});

export default router;