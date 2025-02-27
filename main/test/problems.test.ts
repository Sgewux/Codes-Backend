import request from "supertest";
import app from "../src/app";

describe("GET /problems", () => {
  it("should return a list of problems with valid query parameters", async () => {
    const response = await request(app).get("/problems").query({
      pageLen: 10,
      page: 1,
      user: "test_user",
      filter: "accepted",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("numOfPages");
    expect(response.body).toHaveProperty("problems");
    expect(Array.isArray(response.body.problems)).toBe(true);
  });

  it("should return 400 for missing or invalid query parameters", async () => {
    const response = await request(app).get("/problems").query({
      pageLen: "invalid", // Not a number
      page: 1,
      filter: "unknown_filter", // Invalid filter
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /problems", () => {
  it("should successfully create a problem with valid input", async () => {
    const response = await request(app).post("/problems").send({
      name: "Sample Problem",
      statement: "Solve this problem...",
      editorial: "Editorial explanation...",
      time_limit_seconds: 2,
      memory_limit_mb: 256,
      problemsetter_handle: "shollyero",
      input: "1 2",
      output: "3",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("OK");
  });

  it("should return 400 if required fields are missing", async () => {
    const response = await request(app).post("/problems").send({
      name: "Incomplete Problem",
      statement: "This problem is missing fields",
      // Missing editorial, time_limit_seconds, memory_limit_mb, etc.
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("There is not enough data to create the problem.");
  });
});