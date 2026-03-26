import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TraditionConnectionBadge } from "../tradition-connection-badge";

describe("TraditionConnectionBadge", () => {
  it("renders 'Branch of:' prefix for branch_of type", () => {
    render(
      <TraditionConnectionBadge
        connectionType="branch_of"
        targetName="Theravada"
        targetSlug="theravada"
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Branch of:/)).toBeInTheDocument();
    expect(screen.getByText(/Theravada/)).toBeInTheDocument();
  });

  it("renders 'Influenced by:' prefix for influenced_by type", () => {
    render(
      <TraditionConnectionBadge
        connectionType="influenced_by"
        targetName="Zen"
        targetSlug="zen"
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Influenced by:/)).toBeInTheDocument();
  });

  it("renders 'Related to:' prefix for related_to type", () => {
    render(
      <TraditionConnectionBadge
        connectionType="related_to"
        targetName="Sufism"
        targetSlug="sufism"
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText(/Related to:/)).toBeInTheDocument();
  });

  it("calls onClick with targetSlug when clicked", () => {
    const onClick = vi.fn();
    render(
      <TraditionConnectionBadge
        connectionType="branch_of"
        targetName="Theravada"
        targetSlug="theravada"
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith("theravada");
  });

  it("applies solid border for branch_of", () => {
    const { container } = render(
      <TraditionConnectionBadge
        connectionType="branch_of"
        targetName="Theravada"
        targetSlug="theravada"
        onClick={vi.fn()}
      />
    );
    const button = container.querySelector("button");
    expect(button?.style.borderStyle).toBe("solid");
  });

  it("applies dashed border for influenced_by", () => {
    const { container } = render(
      <TraditionConnectionBadge
        connectionType="influenced_by"
        targetName="Zen"
        targetSlug="zen"
        onClick={vi.fn()}
      />
    );
    const button = container.querySelector("button");
    expect(button?.style.borderStyle).toBe("dashed");
  });

  it("applies dotted border for related_to", () => {
    const { container } = render(
      <TraditionConnectionBadge
        connectionType="related_to"
        targetName="Sufism"
        targetSlug="sufism"
        onClick={vi.fn()}
      />
    );
    const button = container.querySelector("button");
    expect(button?.style.borderStyle).toBe("dotted");
  });
});
