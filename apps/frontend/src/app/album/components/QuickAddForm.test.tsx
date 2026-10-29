import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuickAddForm } from "./QuickAddForm";

describe("QuickAddForm", () => {
  it("validates the code before calling either add action", async () => {
    const user = userEvent.setup();
    const onAddCollected = vi.fn();
    const onAddDuplicate = vi.fn();

    render(<QuickAddForm onAddCollected={onAddCollected} onAddDuplicate={onAddDuplicate} actionLoading={null} />);

    await user.click(screen.getByRole("button", { name: "+ To Album" }));

    expect(await screen.findByText("Code must be at least 3 characters (e.g., ARG-1).")).toBeInTheDocument();
    expect(onAddCollected).not.toHaveBeenCalled();
    expect(onAddDuplicate).not.toHaveBeenCalled();
  });

  it("normalizes the sticker code before adding it to the album", async () => {
    const user = userEvent.setup();
    const onAddCollected = vi.fn();

    render(<QuickAddForm onAddCollected={onAddCollected} onAddDuplicate={vi.fn()} actionLoading={null} />);

    await user.type(screen.getByPlaceholderText("e.g., ARG-10, ESP-1"), " arg-10 ");
    await user.click(screen.getByRole("button", { name: "+ To Album" }));

    expect(onAddCollected).toHaveBeenCalledWith("ARG-10", expect.any(Function));
  });

  it("routes valid codes to the duplicate action", async () => {
    const user = userEvent.setup();
    const onAddDuplicate = vi.fn();

    render(<QuickAddForm onAddCollected={vi.fn()} onAddDuplicate={onAddDuplicate} actionLoading={null} />);

    await user.type(screen.getByPlaceholderText("e.g., ARG-10, ESP-1"), "esp-1");
    await user.click(screen.getByRole("button", { name: "+ Duplicate" }));

    expect(onAddDuplicate).toHaveBeenCalledWith("ESP-1", expect.any(Function));
  });

  it("disables actions and labels the active operation", () => {
    render(<QuickAddForm onAddCollected={vi.fn()} onAddDuplicate={vi.fn()} actionLoading="duplicate" />);

    expect(screen.getByRole("button", { name: "+ To Album" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});
