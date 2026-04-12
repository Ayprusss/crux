import { expect, test, describe } from "bun:test";
import { normalizeElement, normalizeElements } from "./normalizer";
import type { OverpassElement } from "./fetcher";

describe("normalizeElement", () => {
  test("should normalize a valid node element", () => {
    const element: OverpassElement = {
      type: "node",
      id: 123,
      lat: 45.5,
      lon: -73.5,
      tags: {
        name: "Test Gym",
        leisure: "sports_centre",
        "sport": "climbing",
        "climbing:sport": "yes"
      }
    };
    const result = normalizeElement(element);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Gym");
    expect(result?.slug).toBe("test-gym-123");
    expect(result?.type).toBe("gym");
    expect(result?.latitude).toBe(45.5);
    expect(result?.longitude).toBe(-73.5);
    expect(result?.disciplines).toContain("Sport");
  });

  test("should normalize a valid way element with center", () => {
    const element: OverpassElement = {
      type: "way",
      id: 456,
      center: { lat: 46.0, lon: -74.0 },
      tags: {
        name: "Test Crag",
        natural: "cliff",
        "climbing:trad": "yes"
      }
    };
    const result = normalizeElement(element);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test Crag");
    expect(result?.slug).toBe("test-crag-456");
    expect(result?.type).toBe("crag");
    expect(result?.latitude).toBe(46.0);
    expect(result?.longitude).toBe(-74.0);
    expect(result?.disciplines).toContain("Trad");
  });

  test("should return null for element without name", () => {
    const element: OverpassElement = {
      type: "node",
      id: 789,
      lat: 45.5,
      lon: -73.5,
      tags: {
        leisure: "sports_centre"
      }
    };
    const result = normalizeElement(element);
    expect(result).toBeNull();
  });

  test("should return null for element without coordinates", () => {
    const element: OverpassElement = {
      type: "node",
      id: 101,
      tags: {
        name: "No Coords"
      }
    };
    const result = normalizeElement(element);
    expect(result).toBeNull();
  });
});

describe("normalizeElements", () => {
  test("should return empty array for empty input", () => {
    const result = normalizeElements([]);
    expect(result).toEqual([]);
  });

  test("should filter out invalid elements", () => {
    const elements: OverpassElement[] = [
      {
        type: "node",
        id: 1,
        lat: 45,
        lon: -73,
        tags: { name: "Valid" }
      },
      {
        type: "node",
        id: 2,
        tags: { name: "No Coords" }
      }
    ];
    const result = normalizeElements(elements);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Valid");
  });

  test("should deduplicate elements by slug, keeping the first occurrence", () => {
    const elementsToDedupe: OverpassElement[] = [
      {
        type: "node",
        id: 123,
        lat: 45.5,
        lon: -73.5,
        tags: { name: "Test Place" }
      },
      {
        type: "node",
        id: 123,
        lat: 45.6,
        lon: -73.6,
        tags: { name: "test place" } // Same slug: "test-place-123"
      },
      {
        type: "node",
        id: 123,
        lat: 45.7,
        lon: -73.7,
        tags: { name: "Test! Place?" } // Same slug: "test-place-123"
      }
    ];

    const result = normalizeElements(elementsToDedupe);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Place");
    expect(result[0].latitude).toBe(45.5);
  });

  test("should allow multiple elements with different slugs", () => {
    const elements: OverpassElement[] = [
      {
        type: "node",
        id: 1,
        lat: 45,
        lon: -73,
        tags: { name: "Place A" }
      },
      {
        type: "node",
        id: 2,
        lat: 45,
        lon: -73,
        tags: { name: "Place B" }
      }
    ];
    const result = normalizeElements(elements);
    expect(result).toHaveLength(2);
  });
});
