import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../card";

describe("Card", () => {
  it("renders children", () => {
    const { container } = render(<Card>Card Content</Card>);
    expect(container.textContent).toBe("Card Content");
  });

  it("renders with different padding variants", () => {
    const { container } = render(<Card padding="sm">Small</Card>);
    expect(container.textContent).toBe("Small");
  });
});
