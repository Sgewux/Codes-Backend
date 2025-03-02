import { Router, Request, Response } from "express";
import { ContestantActivity, GetContestantsQuery, SearchContestantQuery } from "../types/contestants";
import callProcedure from "../libs/callProcedure";

const router = Router();

router.get("/contestant/:handle/activity", async (req:Request, res:Response ): Promise<void> => {

  try {
    const { from, to } = req.query;
    const [usr, __] = await callProcedure("find_user_by_handle", [req.params.handle]);
    if(usr.length != 0){
      const [result, _] = await callProcedure("get_submission_activity", [req.params.handle, from, to]);
      let resBody: Array<ContestantActivity> =[];
    
      const format = (d: Date) => {
        const month = (d.getMonth() + 1) >= 10 ? `${(d.getMonth() + 1)}` : `0${d.getMonth() + 1}`;
        const day = (d.getDate() + 1) >= 10 ? `${(d.getDate())}` : `0${d.getDate()}`;
    
        return `${d.getFullYear()}-${month}-${day}`;
      }
    
      result.forEach((r:any) => resBody.push( {date: format(r["date"]), numberOfSubmissions: r["number_of_submissions"]} ));
      res.json(resBody);
      return;
    } else {
      res.status(404).json({"message":"Contestant not found"});
    }

  } catch (e) {
    console.log(e);
    res.status(500).json();
  }

  
});
router.get(
  "/contestants", 
  async (req:Request<any, any, any, GetContestantsQuery>, res:Response ): Promise<void> => {
    const { pageLen, page, user, filter } = req.query;

    if ((pageLen && !isNaN(pageLen)) && (page && !isNaN(page)) && (filter == "all" || filter == "friends")){

      try {
        const [count, result, _] = await callProcedure(
          "get_user_summary_for_user",
          [user, filter, pageLen, (page-1) * pageLen]
        );
  
        let resBody = {
          numOfPages: Math.ceil(count[0].records / pageLen),
          contestants: result
        };
        res.json(resBody);

      } catch (e) {
        console.log(e);
        res.status(500).json();
      }

    } else {
      res.status(400).json;
    }

});

router.get(
  "/contestants/search",
  async (req:Request<any, any, any, SearchContestantQuery>, res:Response): Promise<void> => {
    const { pageLen, page, user, handle } = req.query;

    if ((pageLen && !isNaN(pageLen)) && (page && !isNaN(page)) && handle){

      try {
        const [count, result, _] = await callProcedure(
          "get_user_summary_by_handle",
          [user, handle, pageLen, (page-1) * pageLen]
        );
  
        let resBody = {
          numOfPages: Math.ceil(count[0].records / pageLen),
          contestants: result
        };
        res.json(resBody);

      } catch (e) {
        console.log(e);
        res.status(500).json();
      }

    } else {
      res.status(400).json;
    }
  }
);

export default router;