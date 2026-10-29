import { describe, expect, it } from "vitest";
import Trade from "./Trade";
import User from "./User";

describe("Mongoose model contracts", () => {
  it("requires unique, normalized user identity and password data", () => {
    const email = User.schema.path("email");
    const name = User.schema.path("name");
    const passwordHash = User.schema.path("passwordHash");

    expect(email.options.required).toBe(true);
    expect(email.options.unique).toBe(true);
    expect(email.options.lowercase).toBe(true);
    expect(email.options.trim).toBe(true);
    expect(name.options.required).toBe(true);
    expect(name.options.trim).toBe(true);
    expect(passwordHash.options.required).toBe(true);
    expect(User.schema.options.timestamps).toBe(true);
    expect(User.schema.indexes()).toContainEqual([{ duplicateStickers: 1 }, {}]);
  });

  it("restricts trade status and references both participant users", () => {
    const status = Trade.schema.path("status");
    const senderId = Trade.schema.path("senderId");
    const receiverId = Trade.schema.path("receiverId");

    expect(status.options.enum).toEqual(["pending", "accepted", "rejected", "cancelled"]);
    expect(status.options.default).toBe("pending");
    expect(senderId.options.required).toBe(true);
    expect(senderId.options.ref).toBe("User");
    expect(receiverId.options.required).toBe(true);
    expect(receiverId.options.ref).toBe("User");
    expect(Trade.schema.options.timestamps).toBe(true);
    expect(Trade.schema.indexes()).toContainEqual([{ senderId: 1, status: 1 }, {}]);
    expect(Trade.schema.indexes()).toContainEqual([{ receiverId: 1, status: 1 }, {}]);
  });
});
