import express from "express";
import request from "supertest";
import { z, type ZodType } from "zod";
import { describe, expect, it, vi } from "vitest";
import { validate } from "./validate";

describe("validate middleware", () => {
  it("returns structured 400 errors for invalid input", async () => {
    const app = express();
    app.use(express.json());
    app.post("/test", validate(z.object({ name: z.string().min(2) })), (_req, res) => res.sendStatus(204));

    const response = await request(app).post("/test").send({ name: "x" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.errors).toEqual([
      expect.objectContaining({ field: "name", message: expect.any(String) }),
    ]);
  });

  it("does not expose unexpected validation errors", async () => {
    const app = express();
    app.use(express.json());
    const schema = {
      parseAsync: vi.fn().mockRejectedValue(new Error("private validation implementation detail")),
    } as unknown as ZodType;
    app.post("/test", validate(schema), (_req, res) => res.sendStatus(204));

    const response = await request(app).post("/test").send({ arbitrary: "input" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal validation error." });
    expect(JSON.stringify(response.body)).not.toContain("private validation");
  });
});
