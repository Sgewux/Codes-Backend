import axios from "axios";
import dotenv from "dotenv";
import { Execution } from "../types/execution";

dotenv.config();

const instance = axios.create({
  baseURL: process.env.RUNNER_URL,
  withCredentials: true,
});

export const runCode = async (id: number, code: string, input: string, time_limit: number) => {
  return instance.post<Execution>("/run", { id, code, input, time_limit });
};