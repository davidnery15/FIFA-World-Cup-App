import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  userFindById: vi.fn(),
  userFindOne: vi.fn(),
  userCreate: vi.fn(),
  userFindByIdAndUpdate: vi.fn(),
  userFind: vi.fn(),
  tradeFindOne: vi.fn(),
  tradeCreate: vi.fn(),
  tradeFind: vi.fn(),
  tradeFindById: vi.fn(),
}));

vi.mock("./models/User", () => ({
  default: {
    findById: mocks.userFindById,
    findOne: mocks.userFindOne,
    create: mocks.userCreate,
    findByIdAndUpdate: mocks.userFindByIdAndUpdate,
    find: mocks.userFind,
  },
}));

vi.mock("./models/Trade", () => ({
  default: {
    findOne: mocks.tradeFindOne,
    create: mocks.tradeCreate,
    find: mocks.tradeFind,
    findById: mocks.tradeFindById,
  },
}));

import app from "./app";

const JWT_SECRET = "backend-tests-only-secret";
const SENDER_ID = "507f1f77bcf86cd799439011";
const RECEIVER_ID = "507f1f77bcf86cd799439012";
const OTHER_ID = "507f1f77bcf86cd799439013";

const createUser = (overrides: Record<string, unknown> = {}) => ({
  _id: SENDER_ID,
  name: "Sender",
  email: "sender@example.com",
  passwordHash: "$2a$10$test-hash",
  collectedStickers: ["ARG-1"],
  duplicateStickers: ["ESP-2", "ESP-2", "FRA-3"],
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const createTrade = (overrides: Record<string, unknown> = {}) => ({
  _id: "507f1f77bcf86cd799439014",
  senderId: SENDER_ID,
  receiverId: RECEIVER_ID,
  offeredStickers: ["ESP-2"],
  requestedStickers: ["BRA-4"],
  status: "pending",
  save: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeQuery = <T>(value: T) => ({
  select: vi.fn().mockResolvedValue(value),
  then: (resolve: (value: T) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(value).then(resolve, reject),
});

const authToken = (id = SENDER_ID) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "5m" });
const authHeader = (id = SENDER_ID) => ({ Authorization: `Bearer ${authToken(id)}` });

beforeEach(() => {
  process.env.JWT_SECRET = JWT_SECRET;
  vi.resetAllMocks();

  const sender = createUser();
  mocks.userFindById.mockImplementation((id: string) => {
    if (id === SENDER_ID) return makeQuery(sender);
    if (id === RECEIVER_ID) return makeQuery(createUser({
      _id: RECEIVER_ID,
      name: "Receiver",
      email: "receiver@example.com",
      collectedStickers: [],
      duplicateStickers: ["BRA-4"],
    }));
    return makeQuery(null);
  });
  mocks.userFindOne.mockResolvedValue(null);
  mocks.userCreate.mockResolvedValue(sender);
  mocks.userFindByIdAndUpdate.mockReturnValue(makeQuery(sender));
  mocks.userFind.mockReturnValue(makeQuery([]));
  mocks.tradeFindOne.mockResolvedValue(null);
  mocks.tradeCreate.mockResolvedValue(createTrade());
  mocks.tradeFind.mockReturnValue({
    populate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockResolvedValue([]),
  });
  mocks.tradeFindById.mockResolvedValue(null);
});

describe("API health", () => {
  it("serves a health response without connecting to the database", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});

describe("authentication API", () => {
  it("registers users with a hashed password and never returns the hash", async () => {
    const user = createUser({
      _id: RECEIVER_ID,
      name: "New User",
      email: "new@example.com",
      collectedStickers: [],
      duplicateStickers: [],
    });
    mocks.userCreate.mockResolvedValue(user);

    const response = await request(app).post("/api/auth/register").send({
      name: "  New User  ",
      email: "NEW@example.com ",
      password: "strong-password",
    });

    expect(response.status).toBe(201);
    expect(mocks.userFindOne).toHaveBeenCalledWith({ email: "new@example.com" });
    const createdUser = mocks.userCreate.mock.calls[0][0];
    expect(createdUser.name).toBe("New User");
    expect(createdUser.email).toBe("new@example.com");
    expect(createdUser.passwordHash).not.toBe("strong-password");
    expect(createdUser.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(response.body).not.toHaveProperty("passwordHash");
    expect(response.body).not.toHaveProperty("password");
    expect(jwt.verify(response.body.token, JWT_SECRET)).toMatchObject({ id: RECEIVER_ID });
  });

  it("rejects duplicate registration without creating another user", async () => {
    mocks.userFindOne.mockResolvedValue(createUser());

    const response = await request(app).post("/api/auth/register").send({
      name: "Another User",
      email: "sender@example.com",
      password: "strong-password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already exists/i);
    expect(mocks.userCreate).not.toHaveBeenCalled();
  });

  it("rejects malformed registration before querying the database", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.errors.length).toBeGreaterThanOrEqual(3);
    expect(mocks.userFindOne).not.toHaveBeenCalled();
  });

  it("rejects names that contain only whitespace after normalization", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "   ",
      email: "valid@example.com",
      password: "strong-password",
    });

    expect(response.status).toBe(400);
    expect(mocks.userFindOne).not.toHaveBeenCalled();
  });

  it("authenticates valid credentials and rejects invalid credentials generically", async () => {
    const passwordHash = await (await import("bcryptjs")).default.hash("valid-password", 4);
    mocks.userFindOne.mockResolvedValue(createUser({ passwordHash }));

    const success = await request(app).post("/api/auth/login").send({
      email: " SENDER@EXAMPLE.COM ",
      password: "valid-password",
    });

    expect(success.status).toBe(200);
    expect(mocks.userFindOne).toHaveBeenCalledWith({ email: "sender@example.com" });
    expect(success.body).not.toHaveProperty("passwordHash");
    expect(jwt.verify(success.body.token, JWT_SECRET)).toMatchObject({ id: SENDER_ID });

    mocks.userFindOne.mockResolvedValue(null);
    const failure = await request(app).post("/api/auth/login").send({
      email: "missing@example.com",
      password: "wrong-password",
    });

    expect(failure.status).toBe(401);
    expect(failure.body.message).toBe("Invalid email or password.");
  });
});

describe("authentication and authorization", () => {
  it.each([
    ["album", "/api/album/me"],
    ["market matches", "/api/market/matches"],
    ["market feed", "/api/market/feed"],
    ["trade history", "/api/trades"],
  ])("rejects unauthenticated access to %s", async (_name, path) => {
    const response = await request(app).get(path);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/not authorized/i);
  });

  it("rejects an invalid or expired bearer token without querying users", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app)
      .get("/api/album/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(mocks.userFindById).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("rejects an expired bearer token without querying users", async () => {
    const expiredToken = jwt.sign({ id: SENDER_ID }, JWT_SECRET, { expiresIn: -1 });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app)
      .get("/api/album/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(mocks.userFindById).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("rejects tokens whose user no longer exists", async () => {
    mocks.userFindById.mockReturnValue(makeQuery(null));

    const response = await request(app).get("/api/album/me").set(authHeader(OTHER_ID));

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/no longer exists/i);
  });
});

describe("album API", () => {
  it("returns only the authenticated user's album and counts", async () => {
    const response = await request(app).get("/api/album/me").set(authHeader());

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      _id: SENDER_ID,
      collectedCount: 1,
      duplicateCount: 3,
      collectedStickers: ["ARG-1"],
      duplicateStickers: ["ESP-2", "ESP-2", "FRA-3"],
    });
  });

  it("normalizes sticker codes and adds a collected sticker idempotently", async () => {
    const response = await request(app)
      .post("/api/album/collect")
      .set(authHeader())
      .send({ stickerCode: "  fra-3 " });

    expect(response.status).toBe(200);
    expect(mocks.userFindByIdAndUpdate).toHaveBeenCalledWith(
      SENDER_ID,
      { $addToSet: { collectedStickers: "FRA-3" } },
      { returnDocument: "after" },
    );
    expect(response.body.message).toContain("FRA-3");
  });

  it("rejects invalid sticker codes and does not mutate inventory", async () => {
    const response = await request(app)
      .post("/api/album/duplicate")
      .set(authHeader())
      .send({ stickerCode: "x" });

    expect(response.status).toBe(400);
    expect(mocks.userFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects sticker codes that become empty after trimming", async () => {
    const response = await request(app)
      .post("/api/album/duplicate")
      .set(authHeader())
      .send({ stickerCode: "   " });

    expect(response.status).toBe(400);
    expect(mocks.userFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("does not expose database errors in server responses", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.userFindByIdAndUpdate.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error("database credentials must not leak")),
    });

    const response = await request(app)
      .post("/api/album/collect")
      .set(authHeader())
      .send({ stickerCode: "ARG-1" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error." });
    expect(JSON.stringify(response.body)).not.toContain("database credentials");
    consoleError.mockRestore();
  });

  it("adds duplicate copies without treating them as unique collected stickers", async () => {
    const response = await request(app)
      .post("/api/album/duplicate")
      .set(authHeader())
      .send({ stickerCode: "esp-2" });

    expect(response.status).toBe(200);
    expect(mocks.userFindByIdAndUpdate).toHaveBeenCalledWith(
      SENDER_ID,
      { $push: { duplicateStickers: "ESP-2" } },
      { returnDocument: "after" },
    );
  });

  it("removes exactly one matching duplicate copy", async () => {
    const user = createUser({ duplicateStickers: ["ESP-2", "ESP-2", "FRA-3"] });
    mocks.userFindById.mockReturnValue(makeQuery(user));

    const response = await request(app)
      .delete("/api/album/duplicate")
      .set(authHeader())
      .send({ stickerCode: "ESP-2" });

    expect(response.status).toBe(200);
    expect(user.duplicateStickers).toEqual(["ESP-2", "FRA-3"]);
    expect(user.save).toHaveBeenCalledOnce();
  });

  it("does not save inventory when the requested duplicate is absent", async () => {
    const user = createUser({ duplicateStickers: ["ESP-2"] });
    mocks.userFindById.mockReturnValue(makeQuery(user));

    const response = await request(app)
      .delete("/api/album/duplicate")
      .set(authHeader())
      .send({ stickerCode: "FRA-3" });

    expect(response.status).toBe(400);
    expect(user.save).not.toHaveBeenCalled();
  });
});

describe("market API", () => {
  it("deduplicates match stickers and sorts mutual matches first", async () => {
    const mutual = {
      _id: RECEIVER_ID,
      name: "Mutual",
      email: "mutual@example.com",
      duplicateStickers: ["BRA-4", "BRA-4", "ARG-1"],
      collectedStickers: ["ARG-1"],
    };
    const gift = {
      _id: OTHER_ID,
      name: "Gift",
      email: "gift@example.com",
      duplicateStickers: ["FRA-3"],
      collectedStickers: ["ESP-2", "FRA-3"],
    };
    mocks.userFind.mockReturnValue(makeQuery([gift, mutual]));

    const response = await request(app).get("/api/market/matches").set(authHeader());

    expect(response.status).toBe(200);
    expect(response.body.totalMatches).toBe(2);
    expect(response.body.matches[0]).toMatchObject({
      name: "Mutual",
      stickersWeNeed: ["BRA-4"],
      stickersTheyNeedFromUs: ["ESP-2", "FRA-3"],
      isMutualMatch: true,
    });
    expect(response.body.matches[1].isMutualMatch).toBe(false);
    expect(mocks.userFind).toHaveBeenCalledWith(expect.objectContaining({
      _id: { $ne: SENDER_ID },
    }));
  });

  it("excludes the current user from the duplicate feed and reports unique inventory", async () => {
    mocks.userFind.mockReturnValue(makeQuery([{
      _id: RECEIVER_ID,
      name: "Trader",
      duplicateStickers: ["ARG-1", "ARG-1", "ESP-2"],
    }]));

    const response = await request(app).get("/api/market/feed").set(authHeader());

    expect(response.status).toBe(200);
    expect(response.body.activeTradersCount).toBe(1);
    expect(response.body.feed[0]).toMatchObject({
      userId: RECEIVER_ID,
      totalDuplicates: 3,
      availableStickers: ["ARG-1", "ESP-2"],
    });
    expect(mocks.userFind).toHaveBeenCalledWith(expect.objectContaining({
      _id: { $ne: SENDER_ID },
      "duplicateStickers.0": { $exists: true },
    }));
  });
});

describe("trade creation and ownership", () => {
  it("creates a trade only when both sides own the requested duplicate copies", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: RECEIVER_ID, offeredStickers: ["ESP-2"], requestedStickers: ["BRA-4"] });

    expect(response.status).toBe(201);
    expect(mocks.tradeCreate).toHaveBeenCalledWith({
      senderId: SENDER_ID,
      receiverId: RECEIVER_ID,
      offeredStickers: ["ESP-2"],
      requestedStickers: ["BRA-4"],
      status: "pending",
    });
  });

  it("allows gifts with an empty offer while requiring a requested sticker", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: RECEIVER_ID, offeredStickers: [], requestedStickers: ["BRA-4"] });

    expect(response.status).toBe(201);
  });

  it("rejects self-trades without looking up a receiver or creating a trade", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: SENDER_ID, requestedStickers: ["ESP-2"] });

    expect(response.status).toBe(400);
    expect(mocks.tradeCreate).not.toHaveBeenCalled();
  });

  it("rejects offers exceeding the sender's duplicate inventory", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: RECEIVER_ID, offeredStickers: ["MISSING"], requestedStickers: ["BRA-4"] });

    expect(response.status).toBe(400);
    expect(mocks.userFindById).toHaveBeenCalledTimes(1);
    expect(mocks.tradeCreate).not.toHaveBeenCalled();
  });

  it("counts duplicate requested codes independently to prevent overcommitment", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: RECEIVER_ID, offeredStickers: [], requestedStickers: ["BRA-4", "BRA-4"] });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/target user no longer owns/i);
    expect(mocks.tradeCreate).not.toHaveBeenCalled();
  });

  it("rejects an existing pending trade in either direction", async () => {
    mocks.tradeFindOne.mockResolvedValue(createTrade());

    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: RECEIVER_ID, offeredStickers: [], requestedStickers: ["BRA-4"] });

    expect(response.status).toBe(400);
    expect(mocks.tradeFindOne).toHaveBeenCalledWith(expect.objectContaining({
      status: "pending",
      $or: expect.arrayContaining([
        { senderId: SENDER_ID, receiverId: RECEIVER_ID },
        { senderId: RECEIVER_ID, receiverId: SENDER_ID },
      ]),
    }));
    expect(mocks.tradeCreate).not.toHaveBeenCalled();
  });

  it("rejects missing required trade fields before database access", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: RECEIVER_ID, requestedStickers: [] });

    expect(response.status).toBe(400);
    expect(mocks.userFindById).toHaveBeenCalledOnce();
    expect(mocks.tradeCreate).not.toHaveBeenCalled();
  });

  it("rejects malformed receiver IDs before querying the database", async () => {
    const response = await request(app)
      .post("/api/trades")
      .set(authHeader())
      .send({ receiverId: "not-an-object-id", requestedStickers: ["BRA-4"] });

    expect(response.status).toBe(400);
    expect(mocks.userFindById).toHaveBeenCalledOnce();
    expect(mocks.tradeCreate).not.toHaveBeenCalled();
  });
});

describe("trade response and privacy", () => {
  it("returns only trades involving the authenticated user", async () => {
    const trades = [createTrade()];
    const query = {
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue(trades),
    };
    mocks.tradeFind.mockReturnValue(query);

    const response = await request(app).get("/api/trades").set(authHeader());

    expect(response.status).toBe(200);
    expect(response.body.totalTrades).toBe(1);
    expect(response.body.trades[0]).toMatchObject({
      _id: trades[0]._id,
      senderId: SENDER_ID,
      receiverId: RECEIVER_ID,
      status: "pending",
    });
    expect(mocks.tradeFind).toHaveBeenCalledWith({
      $or: [{ senderId: SENDER_ID }, { receiverId: SENDER_ID }],
    });
    expect(query.populate).toHaveBeenNthCalledWith(1, "senderId", "name email");
    expect(query.populate).toHaveBeenNthCalledWith(2, "receiverId", "name email");
  });

  it("does not allow a sender to accept or reject their own proposal", async () => {
    const trade = createTrade();
    mocks.tradeFindById.mockResolvedValue(trade);

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader())
      .send({ status: "accepted" });

    expect(response.status).toBe(403);
    expect(mocks.userFindById).toHaveBeenCalledOnce();
    expect(trade.save).not.toHaveBeenCalled();
  });

  it("does not allow a receiver to cancel a proposal", async () => {
    mocks.tradeFindById.mockResolvedValue(createTrade());

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader(RECEIVER_ID))
      .send({ status: "cancelled" });

    expect(response.status).toBe(403);
  });

  it("rejects proposals that have already been resolved", async () => {
    mocks.tradeFindById.mockResolvedValue(createTrade({ status: "accepted" }));

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader(RECEIVER_ID))
      .send({ status: "rejected" });

    expect(response.status).toBe(400);
  });

  it("rejects malformed trade IDs before database lookup", async () => {
    const response = await request(app)
      .patch("/api/trades/not-an-object-id")
      .set(authHeader())
      .send({ status: "accepted" });

    expect(response.status).toBe(400);
    expect(mocks.tradeFindById).not.toHaveBeenCalled();
  });

  it("accepts a trade by transferring one copy on each side and updating both albums", async () => {
    const sender = createUser({ duplicateStickers: ["ESP-2", "ESP-2"], collectedStickers: ["ARG-1"] });
    const receiver = createUser({
      _id: RECEIVER_ID,
      name: "Receiver",
      email: "receiver@example.com",
      duplicateStickers: ["BRA-4", "BRA-4"],
      collectedStickers: [],
    });
    mocks.userFindById.mockImplementation((id: string) => makeQuery(id === RECEIVER_ID ? receiver : sender));
    const trade = createTrade();
    mocks.tradeFindById.mockResolvedValue(trade);

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader(RECEIVER_ID))
      .send({ status: "accepted" });

    expect(response.status).toBe(200);
    expect(sender.duplicateStickers).toEqual(["ESP-2"]);
    expect(receiver.duplicateStickers).toEqual(["BRA-4"]);
    expect(sender.collectedStickers).toContain("BRA-4");
    expect(receiver.collectedStickers).toContain("ESP-2");
    expect(sender.save).toHaveBeenCalledOnce();
    expect(receiver.save).toHaveBeenCalledOnce();
    expect(trade.status).toBe("accepted");
    expect(trade.save).toHaveBeenCalledOnce();
  });

  it("auto-rejects acceptance when inventory changed after proposal", async () => {
    const sender = createUser({ duplicateStickers: [] });
    const receiver = createUser({
      _id: RECEIVER_ID,
      duplicateStickers: ["BRA-4"],
      collectedStickers: [],
    });
    mocks.userFindById.mockImplementation((id: string) => makeQuery(id === RECEIVER_ID ? receiver : sender));
    const trade = createTrade();
    mocks.tradeFindById.mockResolvedValue(trade);

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader(RECEIVER_ID))
      .send({ status: "accepted" });

    expect(response.status).toBe(400);
    expect(trade.status).toBe("rejected");
    expect(trade.save).toHaveBeenCalledOnce();
    expect(sender.save).not.toHaveBeenCalled();
    expect(receiver.save).not.toHaveBeenCalled();
  });

  it("completes gift acceptance without consuming sender inventory", async () => {
    const sender = createUser({ duplicateStickers: ["ESP-2"], collectedStickers: [] });
    const receiver = createUser({
      _id: RECEIVER_ID,
      duplicateStickers: ["BRA-4"],
      collectedStickers: [],
    });
    mocks.userFindById.mockImplementation((id: string) => makeQuery(id === RECEIVER_ID ? receiver : sender));
    const trade = createTrade({ offeredStickers: [] });
    mocks.tradeFindById.mockResolvedValue(trade);

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader(RECEIVER_ID))
      .send({ status: "accepted" });

    expect(response.status).toBe(200);
    expect(sender.duplicateStickers).toEqual(["ESP-2"]);
    expect(sender.collectedStickers).toContain("BRA-4");
    expect(receiver.duplicateStickers).toEqual([]);
    expect(sender.save).toHaveBeenCalledOnce();
    expect(receiver.save).toHaveBeenCalledOnce();
  });

  it.each([
    ["rejected", SENDER_ID],
    ["cancelled", RECEIVER_ID],
  ])("prevents unauthorized %s actions", async (status, actorId) => {
    mocks.tradeFindById.mockResolvedValue(createTrade());

    const response = await request(app)
      .patch("/api/trades/507f1f77bcf86cd799439014")
      .set(authHeader(actorId))
      .send({ status });

    expect(response.status).toBe(403);
  });
});
