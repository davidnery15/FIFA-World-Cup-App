import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MatchCard, type MatchData } from "./MatchCard";

const mutualMatch: MatchData = {
  _id: "collector-1",
  name: "Alex",
  email: "alex@example.com",
  stickersWeNeed: ["ARG-1", "ESP-2"],
  stickersTheyNeedFromUs: ["FRA-3", "BRA-4"],
  isMutualMatch: true,
};

describe("MatchCard", () => {
  it("shows mutual matches and proposes the selected sticker pair", () => {
    const onProposeTrade = vi.fn();
    render(<MatchCard match={mutualMatch} onProposeTrade={onProposeTrade} isSubmitting={false} />);

    expect(screen.getByText("Perfect Match")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ESP-2" }));
    fireEvent.click(screen.getByRole("button", { name: "BRA-4" }));
    fireEvent.click(screen.getByRole("button", { name: /Propose Trade/ }));

    expect(onProposeTrade).toHaveBeenCalledWith("collector-1", ["BRA-4"], ["ESP-2"]);
  });

  it("supports a gift request when no offered duplicates are available", () => {
    const onProposeTrade = vi.fn();
    const giftMatch = {
      ...mutualMatch,
      userId: "collector-2",
      _id: undefined,
      stickersTheyNeedFromUs: [],
      isMutualMatch: false,
    };
    render(<MatchCard match={giftMatch} onProposeTrade={onProposeTrade} isSubmitting={false} />);

    expect(screen.getByText("Gift Request")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ask for Gift/ }));

    expect(onProposeTrade).toHaveBeenCalledWith("collector-2", [], ["ARG-1"]);
  });

  it("does not submit while a request is in progress", () => {
    const onProposeTrade = vi.fn();
    render(<MatchCard match={mutualMatch} onProposeTrade={onProposeTrade} isSubmitting />);

    expect(screen.getByRole("button", { name: /Propose Trade/ })).toBeDisabled();
    expect(onProposeTrade).not.toHaveBeenCalled();
  });
});
