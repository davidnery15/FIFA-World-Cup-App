import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlbumStats } from "./AlbumStats";

describe("AlbumStats", () => {
  it("shows collection and duplicate totals with calculated progress", () => {
    const { container } = render(<AlbumStats collectedCount={120} duplicateCount={8} totalStickers={600} />);

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("20.0%")).toBeInTheDocument();
    expect(container.querySelector(".bg-gradient-to-r.from-emerald-500")).toHaveStyle({ width: "20%" });
  });

  it("caps progress at the total album size", () => {
    const { container } = render(<AlbumStats collectedCount={700} duplicateCount={0} totalStickers={600} />);

    expect(screen.getByText("100.0%")).toBeInTheDocument();
    expect(container.querySelector(".bg-gradient-to-r.from-emerald-500")).toHaveStyle({ width: "100%" });
  });
});
