import { Router, Request, Response } from "express";
import callProcedure from "../libs/callProcedure";
import { GetProblemsQuery, SearchProblemsQuery } from "../types/problems";
import { checkAuth } from "../middlewares/auth.middlewares";

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



// CRUD

router.get("/problems/problemsetter/:handle", checkAuth(["problem_setter"]), async (req: Request, res: Response) => {
  const handle = req.user?.handle;
  try {
    const data = await callProcedure("read_problem_by_problemsetter_handle", [handle]);
    res.json({ problems : data[0] });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});


router.post("/problems/", checkAuth(["problem_setter"]), async (req: Request, res: Response) => {
  const { name, statement, editorial, time_limit_seconds, memory_limit_mb, problemsetter_handle, input, output } = req.body;

  if (!name || !statement || !editorial || !time_limit_seconds || !memory_limit_mb || !problemsetter_handle || !input || !output) {
    res.status(400).json({ message: "There is not enough data to create the problem." });
  }

  try {
    await callProcedure("create_problem", [name, statement, editorial, time_limit_seconds, memory_limit_mb, problemsetter_handle, input, output]);
    res.status(201).json({ message: "OK" });
  } catch (e: any) {
    console.error("Error creating the problem:", e);
    res.status(500).json({ message: e.message });
  }
});


router.put("/problems/:id",checkAuth(["problem_setter"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { statement, editorial } = req.body;

  if (!statement && !editorial) {
    res.status(400).json({ success: false, message: "There are no pending changes" });
  }

  try {
    await callProcedure("update_problem", [id, statement, editorial]);

    res.json({ success: true, message: "OK" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});


router.delete("/problems/:id",checkAuth(["problem_setter"]), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await callProcedure("delete_problem", [Number(id)]);
    res.json({ success: true, message: "OK" });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
});



export default router;
