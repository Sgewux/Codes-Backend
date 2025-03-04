import { Request, Response, Router } from "express";
import callProcedure from "../libs/callProcedure";
import { checkAuth } from "../middlewares/auth.middlewares";
import { GetProblemsQuery, SearchProblemsQuery } from "../types/problems";

const router = Router();

/**
 * Retrieves a paginated list of problems based on filter criteria.
 * 
 * @route GET /problems
 * @param {Request} req - Express request object (expects `pageLen`, `page`, `user`, and `filter` in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a list of problems or an error message.
 */
router.get(
  "/problems",
  async (req: Request<any, any, any, GetProblemsQuery>, res: Response) => {
    const { pageLen, page, user, filter } = req.query;

    if (
      pageLen &&
      !isNaN(pageLen) &&
      page &&
      !isNaN(page) &&
      (filter == "accepted" || filter == "all" || filter == "tried")
    ) {
      // Express does not check this
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

/**
 * Searches for problems by name.
 * 
 * @route GET /problems/search
 * @param {Request} req - Express request object (expects `problemName`, `pageLen`, `page`, and `user` in query).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a list of matching problems or an error message.
 */
router.get(
  "/problems/search",
  async (
    req: Request<any, any, any, SearchProblemsQuery>,
    res: Response
  ): Promise<void> => {
    const { problemName, pageLen, page, user } = req.query;

    if (pageLen && !isNaN(pageLen) && page && !isNaN(page) && problemName) {
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
  }
);

/**
 * Retrieves a problem by its ID.
 * 
 * @route GET /problems/:id
 * @param {Request} req - Express request object (expects `id` in params).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the problem details or an error message.
 */
router.get(
  "/problems/:id",
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (id && !isNaN(parseInt(id))) {
      try {
        const [result, _] = await callProcedure("get_problem_by_id", [id]);

        if (result[0]) {
          res.json(result[0]);
        } else {
          res.status(404).json({ message: `No problem with id ${id}` });
        }
      } catch (e) {
        console.log(e);
        res.status(500).json();
      }
    } else {
      res.status(400).json({ message: "Wrong id format" });
    }
  }
);

/**
 * Retrieves problems created by a specific problem setter.
 * 
 * @route GET /problems/problemsetter/:handle
 * @param {Request} req - Express request object (expects authenticated user).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with the list of problems created by the problem setter.
 */
router.get(
  "/problems/problemsetter/:handle",
  checkAuth(["problem_setter"]),
  async (req: Request, res: Response) => {
    const handle = req.user?.handle;
    try {
      const data = await callProcedure("read_problem_by_problemsetter_handle", [
        handle,
      ]);
      res.json({ problems: data[0] });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

/**
 * Creates a new problem.
 * 
 * @route POST /problems/
 * @param {Request} req - Express request object (expects problem details in body).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a success message or an error message.
 */
router.post(
  "/problems/",
  checkAuth(["problem_setter"]),
  async (req: Request, res: Response) => {
    const {
      name,
      statement,
      editorial,
      time_limit_seconds,
      memory_limit_mb,
      problemsetter_handle,
      input,
      output,
    } = req.body;

    if (
      !name ||
      !statement ||
      !editorial ||
      !time_limit_seconds ||
      !memory_limit_mb ||
      !problemsetter_handle ||
      !input ||
      !output
    ) {
      res
        .status(400)
        .json({ message: "There is not enough data to create the problem." });
    }

    try {
      await callProcedure("create_problem", [
        name,
        statement,
        editorial,
        time_limit_seconds,
        memory_limit_mb,
        problemsetter_handle,
        input,
        output,
      ]);
      res.status(201).json({ message: "OK" });
    } catch (e: any) {
      console.error("Error creating the problem:", e);
      res.status(500).json({ message: e.message });
    }
  }
);

/**
 * Updates an existing problem.
 * 
 * @route PUT /problems/:id
 * @param {Request} req - Express request object (expects `id` in params and updated `statement` or `editorial` in body).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a success message or an error message.
 */
router.put(
  "/problems/:id",
  checkAuth(["problem_setter"]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { statement, editorial } = req.body;

    if (!statement && !editorial) {
      res
        .status(400)
        .json({ success: false, message: "There are no pending changes" });
    }

    try {
      await callProcedure("update_problem", [id, statement, editorial]);

      res.json({ success: true, message: "OK" });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

/**
 * Deletes a problem.
 * 
 * @route DELETE /problems/:id
 * @param {Request} req - Express request object (expects `id` in params).
 * @param {Response} res - Express response object.
 * @returns {void} Responds with a success message or an error message.
 */
router.delete(
  "/problems/:id",
  checkAuth(["problem_setter"]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await callProcedure("delete_problem", [Number(id)]);
      res.json({ success: true, message: "OK" });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

export default router;
