import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TradeCard, type TradeItem } from "./TradeCard";

const incomingTrade: TradeItem = {
  _id: "trade-1",
  sender: { _id: "sender-1", name: "Taylor", email: "taylor@example.com" },
  receiver: { _id: "receiver-1", name: "Morgan", email: "morgan@example.com" },
  offeredStickers: ["ARG-1"],
  requestedStickers: ["ESP-2"],
  status: "pending",
};

describe("TradeCard", () => {
  it("shows incoming trade actions and passes the trade ID to the selected action", () => {
    const onAccept = vi.fn();
    const onReject = vi.fn();
    render(
      <TradeCard
        trade={incomingTrade}
        currentUserId="receiver-1"
        onAccept={onAccept}
        onReject={onReject}
        actionLoading={null}
      />,
    );

    expect(screen.getByText("Proposed by")).toBeInTheDocument();
    expect(screen.getByText("Taylor")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Accept & Swap/ }));
    expect(onAccept).toHaveBeenCalledWith("trade-1");
    fireEvent.click(screen.getByRole("button", { name: "Decline" }));
    expect(onReject).toHaveBeenCalledWith("trade-1");
  });

  it("shows an outgoing cancellation action for the sender", () => {
    const onCancel = vi.fn();
    render(<TradeCard trade={incomingTrade} currentUserId="sender-1" onCancel={onCancel} actionLoading={null} />);

    expect(screen.getByText("Sent to")).toBeInTheDocument();
    expect(screen.getByText("Morgan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel Request" }));
    expect(onCancel).toHaveBeenCalledWith("trade-1");
    expect(screen.queryByRole("button", { name: /Accept & Swap/ })).not.toBeInTheDocument();
  });

  it("shows accepted gifts without pending actions", () => {
    render(
      <TradeCard
        trade={{ ...incomingTrade, offeredStickers: [], status: "accepted" }}
        currentUserId="receiver-1"
        onAccept={vi.fn()}
        actionLoading={null}
      />,
    );

    expect(screen.getByText("Gift Accepted")).toBeInTheDocument();
    expect(screen.getByText("Nothing (Gift 🎁)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Grant Gift" })).not.toBeInTheDocument();
  });
});
