import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { Execution } from "../types/execution";

/**
 * Runs a C++ program in a temporary directory and captures execution details.
 * 
 * This function:
 * - Creates a temporary directory for execution.
 * - Writes the provided C++ code and input to files.
 * - Compiles and executes the program using a Bash script.
 * - Captures execution time, output, and logs.
 * - Handles compilation errors, runtime errors, and time limit exceeded cases.
 * - Cleans up the temporary directory after execution.
 * 
 * @param {number} id - A unique identifier for the execution session.
 * @param {string} code - The C++ source code to compile and execute.
 * @param {string} input - The input data for the program.
 * @param {number} time_limit - The maximum execution time in seconds.
 * @returns {Promise<Execution>} An object containing execution status, time, output, and logs.
 */
async function run(
  id: number,
  code: string,
  input: string,
  time_limit: number
): Promise<Execution> {
  const tempDir: string = path.join(".", "src", "temp", `temp_${id}`);
  const exec: Execution = {
    status: undefined,
    execution_time: undefined,
    output: undefined,
    log: undefined,
  };

  try {
    // Create temporary directory
    fs.mkdirSync(tempDir);

    // Write C++ source file
    fs.writeFileSync(path.join(tempDir, "main.cpp"), code);

    // Write input file
    fs.writeFileSync(path.join(tempDir, "in.txt"), input);

    try {
      // Execute Bash script to compile and run the code
      const result: string = execSync(
        `bash -c "./src/CompileAndRun.sh ${tempDir.replace(
          /\\/g,
          "/"
        )}/ main.cpp ${time_limit}s"`
      ).toString(); // Script's echo is the execution time in ms

      exec.status = "OK";
      exec.execution_time = (parseFloat(result) / 1000).toFixed(3); // Convert ms to seconds
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
      exec.log = fs.readFileSync(path.join(tempDir, "log.txt"), "utf-8");
    }
    // Cleanup: Remove temporary directory
    fs.rmSync(tempDir, { recursive: true });
  } catch (e: any) {
    console.log(e);
  }
  return exec;
}

export default run;
