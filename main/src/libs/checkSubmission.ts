import dotenv from "dotenv";
import { RowDataPacket } from "mysql2";
import { SubmissionResult } from "../types/submissions";
import callProcedure from "./callProcedure";
import { runCode } from "./callRunnerService";

dotenv.config();

/**
 * Checks a submission by running it against all test cases for a problem.
 * 
 * This function:
 * - Retrieves test cases from the database using a stored procedure.
 * - Runs the submission against each test case.
 * - Evaluates the output and determines the verdict.
 * - Returns an appropriate verdict (`AC`, `WA`, `CE`, `TL`, `RT`).
 * 
 * @param {number} submission_id - Unique identifier for the submission.
 * @param {number} problem_id - ID of the problem to fetch test cases for.
 * @param {string} code - The C++ source code submitted.
 * @param {number} time_limit - Maximum execution time in seconds.
 * @returns {Promise<SubmissionResult>} A promise resolving to the submission result.
 * @throws {Error} If an error occurs during submission evaluation.
 */
async function checkSubmission(
  submission_id: number,
  problem_id: number,
  code: string,
  time_limit: number
): Promise<SubmissionResult> {
  try {
    // Fetch test cases for the given problem
    const result = await callProcedure("get_problem_tests", [problem_id]);
    const rows: RowDataPacket[] = result[0] as RowDataPacket[];

    let executionTime: number = 0;

    for (const test of rows) {
      const { input, output: expectedOutput } = test;

      // Run the submission against the test case
      const { data } = await runCode(submission_id, code, input, time_limit);
      executionTime = Math.max(executionTime, Number(data.execution_time));

      // Handle different execution statuses
      if (data.status === "COMPILATION_ERROR") {
        return {
          verdict: "CE",
          execution_time: 0,
          log: data.log,
        };
      }

      if (data.status === "TIME_LIMIT_EXCEEDED") {
        return {
          verdict: "TL",
          execution_time: time_limit,
        };
      }

      if (data.status === "RUNTIME_ERROR") {
        return {
          verdict: "RT",
          execution_time: 0,
          log: data.log,
        };
      }

      // Compare actual output with expected output
      if (data.output?.trim() !== expectedOutput.trim()) {
        return {
          verdict: "WA",
          execution_time: executionTime,
        };
      }
    }

    // If all test cases pass
    return {
      verdict: "AC",
      execution_time: executionTime,
    };
  } catch (e) {
    throw new Error("Submission checking failed");
  }
}

export default checkSubmission;
