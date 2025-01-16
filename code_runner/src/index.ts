import app from "./app";

function main() {
  try {
    app.listen(process.env.PORT);
    console.log(`Listening on port: ${process.env.PORT}`);
  } catch (e) {
    console.error(e);
  }
}

main();
