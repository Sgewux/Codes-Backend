import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Execution } from "../types/execution";

async function run(id: number, code: string, input: string, time_limit: number): Promise<Execution> {
  const tempDir: string = path.join(".", "src", "temp", `temp_${id}`);
  const exec: Execution = {
    status: undefined,
    execution_time: undefined,
    output: undefined,
    log: undefined
  };

  try {
    // Create temporary dir
    fs.mkdirSync(tempDir);

    // Create cpp file
    fs.writeFileSync(path.join(tempDir, "main.cpp"), code);

    // Write input file
    fs.writeFileSync(path.join(tempDir, "in.txt"), input);

    try {
      // Execute Bash Script
      const result: string = execSync(`./src/libs/CompileAndRun.sh ${tempDir}/ main.cpp ${time_limit}s`).toString(); // Script's echo is the execution time in ms

      exec.status = "OK";
      exec.execution_time = (parseFloat(result) / 1000).toFixed(3); // execution time in seconds
      exec.output = fs.readFileSync(path.join(tempDir, "out.txt"), "utf-8");
    } catch (e: any) {
      if (e.status === 1) {
        exec.status = "COMPILATION_ERROR";
      } else if (e.status === 124) {
        exec.status = "TIME_LIMIT_EXCEEDED";
        exec.execution_time = time_limit.toFixed(3);
      } else {
        exec.status = "RUNTIME_ERROR";
      }
    } finally {
      exec.log = fs.readFileSync(path.join(tempDir, "log.txt"), "utf-8")
    }
    fs.rmSync(tempDir, { recursive: true });
  } catch (e: any) {
    console.log(e);
  }
  return exec;
}

export default run;
