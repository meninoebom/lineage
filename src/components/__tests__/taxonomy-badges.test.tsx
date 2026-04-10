import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaxonomyBadges } from "../taxonomy-badges";

describe("TaxonomyBadges", () => {
  it("renders nothing when no taxonomy fields provided", () => {
    const { container } = render(<TaxonomyBadges />);
    expect(container.innerHTML).toBe("");
  });

  it("renders experience level badge", () => {
    render(<TaxonomyBadges experienceLevel="beginner" />);
    expect(screen.getByText("Beginner")).toBeInTheDocument();
  });

  it("renders all three experience levels with distinct styles", () => {
    const { rerender } = render(
      <TaxonomyBadges experienceLevel="beginner" />
    );
    const beginner = screen.getByText("Beginner");
    expect(beginner.className).toContain("bg-[#eaf2ea]");

    rerender(<TaxonomyBadges experienceLevel="intermediate" />);
    const intermediate = screen.getByText("Intermediate");
    expect(intermediate.className).toContain("bg-[#f3e8e5]");

    rerender(<TaxonomyBadges experienceLevel="advanced" />);
    const advanced = screen.getByText("Advanced");
    expect(advanced.className).toContain("bg-[#1a1a1a]/10");
  });

  it("renders topic badges", () => {
    render(
      <TaxonomyBadges topics={["meditation-technique", "daily-life"]} />
    );
    expect(screen.getByText("Meditation Technique")).toBeInTheDocument();
    expect(screen.getByText("Daily Life")).toBeInTheDocument();
  });

  it("renders practice context badges with dashed border", () => {
    render(
      <TaxonomyBadges practiceContext={["new-to-practice", "retreat-prep"]} />
    );
    const badge = screen.getByText("New To Practice");
    expect(badge.className).toContain("border-dashed");
  });

  it("renders all fields together", () => {
    render(
      <TaxonomyBadges
        experienceLevel="intermediate"
        topics={["philosophy"]}
        practiceContext={["academic"]}
      />
    );
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
    expect(screen.getByText("Philosophy")).toBeInTheDocument();
    expect(screen.getByText("Academic")).toBeInTheDocument();
  });

  it("handles empty arrays gracefully", () => {
    const { container } = render(
      <TaxonomyBadges topics={[]} practiceContext={[]} />
    );
    expect(container.innerHTML).toBe("");
  });
});
