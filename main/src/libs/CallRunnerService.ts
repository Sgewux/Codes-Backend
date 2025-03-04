import axios from "axios";
import dotenv from "dotenv";
import { Execution } from "../types/execution";

dotenv.config();

/**
 * Axios instance configured for the code execution service.
 * - Uses `RUNNER_URL` from environment variables as the base URL.
 * - Enables credentials for cross-origin requests.
 */
const instance = axios.create({
  baseURL: process.env.RUNNER_URL,
  withCredentials: true,
});

/**
 * Sends a request to the code execution service to run a C++ program.
 * 
 * @param {number} id - Unique identifier for the execution.
 * @param {string} code - The C++ source code to be executed.
 * @param {string} input - The input data for the program.
 * @param {number} time_limit - The maximum execution time in seconds.
 * @returns {Promise<Execution>} A promise resolving to the execution result.
 * @throws {Error} If the request fails.
 */
export const runCode = async (
  id: number,
  code: string,
  input: string,
  time_limit: number
) => {
  return instance.post<Execution>("/run", { id, code, input, time_limit });
};
