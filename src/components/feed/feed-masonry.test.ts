import { describe, expect, it } from "vitest";
import { distributeRoundRobin, getFeedColumnCount } from "./feed-masonry";

describe("getFeedColumnCount", () => {
  it("returns 1 column on narrow screens", () => {
    expect(getFeedColumnCount(1100)).toBe(1);
    expect(getFeedColumnCount(800)).toBe(1);
  });

  it("returns 2 columns on medium screens", () => {
    expect(getFeedColumnCount(1101)).toBe(2);
    expect(getFeedColumnCount(1399)).toBe(2);
  });

  it("returns 3 columns on wide screens", () => {
    expect(getFeedColumnCount(1400)).toBe(3);
    expect(getFeedColumnCount(1920)).toBe(3);
  });
});

describe("distributeRoundRobin", () => {
  it("fills left to right across columns", () => {
    expect(distributeRoundRobin(["a", "b", "c", "d", "e"], 3)).toEqual([
      ["a", "d"],
      ["b", "e"],
      ["c"],
    ]);
  });

  it("keeps a single column in order", () => {
    expect(distributeRoundRobin([1, 2, 3], 1)).toEqual([[1, 2, 3]]);
  });
});
