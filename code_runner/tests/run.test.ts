import request from "supertest";
import app from "../src/app";

describe("POST /run", () => {
  it("should successfully execute a valid C++ program", async () => {
    const response = await request(app).post("/run").send({
      id: 1,
      code: `#include <iostream>\nusing namespace std;\nint main() { int a, b; cin >> a >> b; cout << a + b << endl; return 0; }`,
      input: "3 5",
      time_limit: 2
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(response.body.output).toBe("8\n");
    expect(parseFloat(response.body.execution_time)).toBeGreaterThan(0);
  });

  it("should return COMPILATION_ERROR for invalid C++ code", async () => {
    const response = await request(app).post("/run").send({
      id: 2,
      code: `#include <iostream>\nusing namespace std;\nint main() { int a, b cin >> a >> b; cout << a + b << endl; return 0; }`, // Missing semicolon
      input: "3 5",
      time_limit: 2
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("COMPILATION_ERROR");
  });

  it("should return TIME_LIMIT_EXCEEDED for an infinite loop", async () => {
    const response = await request(app).post("/run").send({
      id: 3,
      code: `#include <iostream>\nusing namespace std;\nint main() { while(true) {} return 0; }`,
      input: "",
      time_limit: 2
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("TIME_LIMIT_EXCEEDED");
  });

  it("should handle server errors gracefully", async () => {
    jest.spyOn(console, "error").mockImplementation(() => { });

    const response = await request(app).post("/run").send({
      id: "invalid_id", 
      code: "int main() { return 0; }",
      input: "",
      time_limit: 2
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid input parameters");
  });
});