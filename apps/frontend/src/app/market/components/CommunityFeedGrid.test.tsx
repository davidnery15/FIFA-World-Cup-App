import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommunityFeedGrid, type FeedTrader } from "./CommunityFeedGrid";

const traders: FeedTrader[] = [
  { userId: "user-1", name: "Sam", totalDuplicates: 2, availableStickers: ["ARG-1", "ESP-3"] },
];

describe("CommunityFeedGrid", () => {
  it("renders loading placeholders while the feed is loading", () => {
    const { container } = render(<CommunityFeedGrid traders={[]} isLoading />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("No Active Traders Yet")).not.toBeInTheDocument();
  });

  it("renders an empty-state message when there are no traders", () => {
    render(<CommunityFeedGrid traders={[]} isLoading={false} />);

    expect(screen.getByRole("heading", { name: "No Active Traders Yet" })).toBeInTheDocument();
  });

  it("renders trader details and available inventory", () => {
    render(<CommunityFeedGrid traders={traders} isLoading={false} />);

    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("2 Duplicates")).toBeInTheDocument();
    expect(screen.getByText("ARG-1")).toBeInTheDocument();
    expect(screen.getByText("ESP-3")).toBeInTheDocument();
  });
});
