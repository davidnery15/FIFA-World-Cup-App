import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import apiClient from "../lib/apiClient";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("../lib/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const user = {
  _id: "user-1",
  name: "Alex",
  email: "alex@example.com",
  collectedStickers: ["ARG-1"],
  duplicateStickers: ["ESP-2"],
};

const AuthState = () => {
  const { user: currentUser, isAuthenticated, isLoading, login, register, refreshUserAlbum } = useAuth();

  return (
    <div>
      <span>{isLoading ? "Loading" : "Ready"}</span>
      <span>{isAuthenticated ? currentUser?.name : "Guest"}</span>
      <button onClick={() => void login("alex@example.com", "password")}>Login</button>
      <button onClick={() => void register("Alex", "alex@example.com", "password")}>Register</button>
      <button onClick={() => void refreshUserAlbum()}>Refresh album</button>
    </div>
  );
};

const renderAuth = () => render(<AuthProvider><AuthState /></AuthProvider>);

afterEach(() => {
  localStorage.clear();
});

describe("AuthContext", () => {
  it("initializes as a guest when there is no persisted session", async () => {
    renderAuth();

    expect(await screen.findByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  it("restores a valid persisted user", async () => {
    localStorage.setItem("token", "session-token");
    localStorage.setItem("user", JSON.stringify(user));

    renderAuth();

    expect(await screen.findByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("clears malformed persisted authentication data", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    localStorage.setItem("token", "session-token");
    localStorage.setItem("user", "{malformed");

    renderAuth();

    expect(await screen.findByText("Guest")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to parse stored authentication data:",
      expect.any(SyntaxError),
    );
  });

  it("persists the user and token after a successful login", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { ...user, token: "new-token" } });
    renderAuth();

    await screen.findByText("Ready");
    await act(async () => {
      screen.getByRole("button", { name: "Login" }).click();
    });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "alex@example.com",
      password: "password",
    });
    expect(localStorage.getItem("token")).toBe("new-token");
    expect(JSON.parse(localStorage.getItem("user") || "null")).toEqual(user);
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("registers new users through the same persisted session flow", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { ...user, token: "registered-token" } });
    renderAuth();

    await screen.findByText("Ready");
    await act(async () => {
      screen.getByRole("button", { name: "Register" }).click();
    });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
      name: "Alex",
      email: "alex@example.com",
      password: "password",
    });
    expect(localStorage.getItem("token")).toBe("registered-token");
    expect(screen.getByText("Alex")).toBeInTheDocument();
  });

  it("refreshes and persists album inventory for an authenticated user", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { ...user, token: "session-token" } });
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { collectedStickers: ["ARG-1", "FRA-4"], duplicateStickers: [] },
    });
    renderAuth();

    await screen.findByText("Ready");
    await act(async () => {
      screen.getByRole("button", { name: "Login" }).click();
    });
    await act(async () => {
      screen.getByRole("button", { name: "Refresh album" }).click();
    });

    expect(apiClient.get).toHaveBeenCalledWith("/album/me");
    expect(JSON.parse(localStorage.getItem("user") || "null")).toEqual({
      ...user,
      collectedStickers: ["ARG-1", "FRA-4"],
      duplicateStickers: [],
    });
  });
});
