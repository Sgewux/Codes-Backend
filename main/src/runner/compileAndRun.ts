import instance from "./axios";
import { Execution } from "../types/execution";

export const postCompileAndRun = async (
  id: number,
  code: string,
  input: string,
  time_limit: number
) => {
  return instance.post<Execution>("/run", {
    id,
    code,
    input,
    time_limit,
  });
};
