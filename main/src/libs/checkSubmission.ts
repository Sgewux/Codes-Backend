import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";
import { SubmissionResult } from "../types/submissions";
import callProcedure from "./callProcedure";
import { runCode } from "./callRunnerService";

dotenv.config();

async function checkSubmission(submission_id: number, problem_id: number, code: string, time_limit: number): Promise<SubmissionResult> {
  try {
    const result = await callProcedure("get_problem_tests", [problem_id]);
    const rows: RowDataPacket[] = result[0] as RowDataPacket[];

    let executionTime: number = 0;

    for (const test of rows) {
      const { input, output: expectedOutput } = test;
      const { data } = await runCode(submission_id, code, input, time_limit);
      executionTime = Math.max(executionTime, Number(data.execution_time));

      if (data.status == "COMPILATION_ERROR") {
        return {
          verdict: "CE",
          execution_time: 0,
          log: data.log
        };
      }

      if (data.status == "TIME_LIMIT_EXCEEDED") {
        return {
          verdict: "TL",
          execution_time: time_limit
        };
      }

      if (data.status == "RUNTIME_ERROR") {
        return {
          verdict: "RT",
          execution_time: 0,
          log: data.log
        };
      }

      if (data.output?.trim() !== expectedOutput.trim()) {
        return {
          verdict: "WA",
          execution_time: executionTime
        };
      }
    }
    return {
      verdict: "AC",
      execution_time: executionTime,
    };
  } catch (e) {
    throw new Error("Submission checking failed");
  }
}

export default checkSubmission;
