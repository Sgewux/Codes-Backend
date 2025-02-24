import fs from "fs";
import path from "path";
import getConnection from "./db";

async function runScripts() {
  const connection = await getConnection();
  const dbPath = path.resolve(__dirname, "../../../Database");

  const scripts = [
    "schema_definition.sql",
    "functions.sql",
    "views.sql",
    "insertion_scripts.sql",
    "stored_procedures/sp_auth.sql",
    "stored_procedures/sp_problems.sql",
    "stored_procedures/sp_submissions.sql",
    "stored_procedures/sp_users.sql",
  ];

  for (const script of scripts) {
    const scriptPath = path.join(dbPath, script);
    try {
      const sql = fs.readFileSync(scriptPath, "utf-8");
      await connection.query(sql);
      console.log("✅ Successfully executed");
    } catch (error) {
      console.error("");
    }
  }

  await connection.end();
}

export default runScripts;


