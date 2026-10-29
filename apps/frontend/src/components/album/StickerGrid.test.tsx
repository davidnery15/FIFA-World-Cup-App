import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StickerGrid } from "./StickerGrid";

const defaultProps = {
  title: "Collected Album",
  icon: "🛡️",
  stickers: ["ARG-1", "ESP-2"],
  emptyTitle: "No stickers yet",
  emptySubtitle: "Add your first sticker to get started.",
  theme: "emerald" as const,
  badgeLabel: "CODE",
};

describe("StickerGrid", () => {
  it("renders sticker codes and the pluralized count", () => {
    render(<StickerGrid {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "🛡️ Collected Album" })).toBeInTheDocument();
    expect(screen.getByText("2 Stickers")).toBeInTheDocument();
    expect(screen.getByText("ARG-1")).toBeInTheDocument();
    expect(screen.getByText("ESP-2")).toBeInTheDocument();
  });

  it("renders the empty state and singularizes the count", () => {
    const { rerender } = render(<StickerGrid {...defaultProps} stickers={[]} />);

    expect(screen.getByText("0 Stickers")).toBeInTheDocument();
    expect(screen.getByText("No stickers yet")).toBeInTheDocument();

    rerender(<StickerGrid {...defaultProps} stickers={["ARG-1"]} />);
    expect(screen.getByText("1 Sticker")).toBeInTheDocument();
  });

  it("removes a sticker when requested and disables its pending action", () => {
    const onRemoveSticker = vi.fn();
    render(<StickerGrid {...defaultProps} onRemoveSticker={onRemoveSticker} actionLoading="remove-ARG-1" />);

    const removeButtons = screen.getAllByRole("button", { name: /Remove one copy of/ });
    expect(removeButtons[0]).toBeDisabled();
    expect(removeButtons[1]).toBeEnabled();

    fireEvent.click(removeButtons[1]);
    expect(onRemoveSticker).toHaveBeenCalledWith("ESP-2");
  });
});
