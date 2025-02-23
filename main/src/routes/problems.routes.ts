import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";
import { GetProblemsQuery, SearchProblemsQuery } from "../types/problems";

const router = Router();

router.get(
  "/problems",
  async (req: Request<any, any, any, GetProblemsQuery>, res: Response) => {
    const { pageLen, page, user, filter } = req.query;

    if((pageLen && !isNaN(pageLen)) && (page && !isNaN(page)) && (filter == "accepted" || filter == "all" || filter == "tried")){ // Express does not check this
      try {
        const [count, result, _] = await callProcedure(
          "get_problem_details_for_user",
          [user ? user : "null", filter, pageLen, (page - 1) * pageLen]
        );
  
        let resBody = {
          numOfPages: Math.ceil(count[0].records / pageLen),
          problems: result,
        };
  
        res.json(resBody);
  
      } catch (e) {
        console.log(e);
        res.status(500).json();
      }
    } else {
      res.status(400).json();
    }

  }
);

router.get("/problems/search", async (req: Request<any, any, any, SearchProblemsQuery>, res: Response): Promise<void> => {
  const { problemName, pageLen, page, user } = req.query;

  if((pageLen && !isNaN(pageLen)) && (page && !isNaN(page)) && problemName){
    try {
      const [count, result, _] = await callProcedure(
        "get_problem_details_by_name",
        [problemName, user ? user : "null", pageLen, (page - 1) * pageLen]
      );

      let resBody = {
        numOfPages: Math.ceil(count[0].records / pageLen),
        problems: result,
      };

      res.json(resBody);

    } catch (e) {
      console.log(e);
      res.status(500).json();
    }

  } else {
    res.status(400).json();
  }

});

router.get("/problems/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if(id && !isNaN(parseInt(id))){
    try {
      const [result, _] = await callProcedure(
        "get_problem_by_id",
        [id]
      );
  
      if(result[0]){
        res.json(result[0]);
      } else {
        res.status(404).json({"message": `No problem with id ${id}`});
      }

    } catch (e) {
      console.log(e);
      res.status(500).json();
    }
  } else {
    res.status(400).json({"message": "Wrong id format"});
  }
});

export default router;
