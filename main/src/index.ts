import dotenv from "dotenv";
import app from "./app";

dotenv.config();

function main() {
  try {
    app.listen(process.env.PORT);
    console.log(`Listening on port: ${process.env.PORT}`);
  } catch (e) {
    console.error(e);
  }
}

main();