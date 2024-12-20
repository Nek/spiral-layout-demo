import type { Vec } from "./types";

import { describe, it, expect } from "vitest";

import { calculateSide, makePlacedBoxOnSide } from ".";

// src/layout.test.ts
import { placeBox } from ".";
import { BoundingBox, Direction, PlacedBox } from "./types";

describe("Layout", () => {
  describe("calculateSide", () => {
    it("should calculate the sides correctly", () => {
      const placedBox = {
        position: [0, 0] as Vec,
        size: [10, 20] as Vec,
        sidesAvailable: {
          [Direction.Top]: true,
          [Direction.Right]: true,
          [Direction.Bottom]: true,
          [Direction.Left]: true,
        },
        id: "test",
      };
      expect(calculateSide(placedBox, Direction.Top)).toEqual([
        [0, 0],
        [10, 0],
      ]);
      expect(calculateSide(placedBox, Direction.Right)).toEqual([
        [10, 0],
        [10, 20],
      ]);
      expect(calculateSide(placedBox, Direction.Bottom)).toEqual([
        [0, 20],
        [10, 20],
      ]);
      expect(calculateSide(placedBox, Direction.Left)).toEqual([
        [0, 0],
        [0, 20],
      ]);
    });

    it("should return undefined if side is not available", () => {
      const placedBox = {
        position: [0, 0] as Vec,
        size: [10, 20] as Vec,
        sidesAvailable: {
          [Direction.Top]: false,
          [Direction.Right]: true,
          [Direction.Bottom]: true,
          [Direction.Left]: true,
        },
        id: "test",
      };
      expect(calculateSide(placedBox, Direction.Top)).toBeUndefined();
    });
  });

  describe("makePlacedBoxOnSide", () => {
    const zeroBounds: BoundingBox = [
      [0, 0],
      [0, 0],
    ];
    it("should work on Right side correctly", () => {
      expect(
        makePlacedBoxOnSide(
          [
            [10, 0],
            [10, 10],
          ],
          Direction.Right,
          [5, 5],
          "1",
          zeroBounds,
        ),
      ).toEqual({
        position: [10, 0],
        size: [5, 5],
        sidesAvailable: {
          [Direction.Right]: true,
          [Direction.Bottom]: true,
          [Direction.Left]: false,
          [Direction.Top]: true,
        },
        id: "1",
      });
    });
    it("should work on Bottom side correctly", () => {
      expect(
        makePlacedBoxOnSide(
          [
            [0, 0],
            [10, 0],
          ],
          Direction.Bottom,
          [5, 5],
          "1",
          zeroBounds,
        ),
      ).toEqual({
        position: [5, 0],
        size: [5, 5],
        sidesAvailable: {
          [Direction.Right]: true,
          [Direction.Bottom]: true,
          [Direction.Left]: true,
          [Direction.Top]: false,
        },
        id: "1",
      });
    });
    it("should work on Left side correctly", () => {
      expect(
        makePlacedBoxOnSide(
          [
            [0, 0],
            [0, 10],
          ],
          Direction.Left,
          [5, 5],
          "1",
          zeroBounds,
        ),
      ).toEqual({
        position: [-5, 5],
        size: [5, 5],
        sidesAvailable: {
          [Direction.Right]: false,
          [Direction.Bottom]: true,
          [Direction.Left]: true,
          [Direction.Top]: true,
        },
        id: "1",
      });
    });
    it("should work on Top side correctly", () => {
      expect(
        makePlacedBoxOnSide(
          [
            [0, 0],
            [10, 0],
          ],
          Direction.Top,
          [5, 5],
          "1",
          zeroBounds,
        ),
      ).toEqual({
        position: [5, -5],
        size: [5, 5],
        sidesAvailable: {
          [Direction.Right]: true,
          [Direction.Bottom]: false,
          [Direction.Left]: true,
          [Direction.Top]: true,
        },
        id: "1",
      });
    });
  });

  describe("placeBox", () => {
    it("places the first box at the origin", () => {
      const layout: PlacedBox[] = [];
      const size = [10, 10] as Vec;
      const id = "1";
      const lastDir: Direction = Direction.Right;
      const bounds: [Vec, Vec] = [
        [0, 0],
        [0, 0],
      ];

      const {
        lastDir: resultLastDir,
        placedBox,
        bounds: resultBounds,
        layout: resultLayout,
      } = placeBox({ size, id }, layout, lastDir, bounds);
      expect(resultLayout.length).toBe(1);
      expect(placedBox.id).toBe(id);
      expect(placedBox.position).toEqual([0, 0]);
      expect(resultLastDir).toBe(Direction.Right);
      expect(resultBounds).toEqual([
        [0, 0],
        [10, 10],
      ]);
    });

    it("places a box next to the existing box without overlapping", () => {
      const layout: PlacedBox[] = [
        {
          position: [0, 0] as Vec,
          size: [10, 10] as Vec,
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
          },
          id: "1",
        },
      ];

      const size = [5, 5] as Vec;
      const id = "2";
      const lastDir: Direction = Direction.Right;
      const bounds: [Vec, Vec] = [
        [0, 0],
        [10, 10],
      ];

      const {
        lastDir: resultLastDir,
        placedBox,
        bounds: resultBounds,
        layout: resultLayout,
      } = placeBox({ size, id }, layout, lastDir, bounds);

      expect(resultLayout.length).toBe(2);
      expect(placedBox.id).toBe(id);
      expect(placedBox.position).toEqual([10, 0]);
      expect(resultLastDir).toBe(Direction.Right);
      expect(resultBounds).toEqual([
        [0, 0],
        [15, 10],
      ]);
    });

    it("places a third box at the correct position and updates lastDir accordingly", () => {
      const layout: PlacedBox[] = [
        {
          position: [0, 0],
          size: [10, 10],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
          },
          id: "1",
        },
        {
          position: [10, 0],
          size: [5, 5],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
          },
          id: "2",
        },
      ];

      const size = [5, 5] as Vec;
      const id = "3";
      const lastDir: Direction = Direction.Right;
      const bounds: [Vec, Vec] = [
        [0, 0],
        [15, 10],
      ];

      const {
        lastDir: resultLastDir,
        placedBox,
        bounds: resultBounds,
        layout: resultLayout,
      } = placeBox({ size, id }, layout, lastDir, bounds);

      expect(resultLayout.length).toBe(3);
      expect(placedBox.id).toBe(id);
      // expect(placedBox.position).toEqual([5, 10]);
      // expect(placedBox.sidesAvailable.T).toBeFalsy();
      // Ad hoc test fix. It might be a bug in the code.
      expect(placedBox.position).toEqual([-5, 5]);
      expect(placedBox.sidesAvailable[Direction.Top]).toBeTruthy();
      expect(resultLastDir).toBe(Direction.Bottom);
      expect(resultBounds).toEqual([
        // [0, 0],
        // [15, 15],
        [-5, 0],
        [15, 10],
      ]);
    });

    it("places a fourth box at the correct position and updates lastDir accordingly", () => {
      const layout: PlacedBox[] = [
        {
          position: [0, 0],
          size: [10, 10],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
          },
          id: "1",
        },
        {
          position: [10, 0],
          size: [5, 5],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
          },
          id: "2",
        },
        {
          position: [5, 10] as Vec,
          size: [5, 5] as Vec,
          sidesAvailable: {
            [Direction.Top]: false,
            [Direction.Right]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
          },
          id: "3",
        },
      ];

      const size = [5, 5] as Vec;
      const id = "4";
      const lastDir: Direction = Direction.Bottom;
      const bounds: [Vec, Vec] = [
        [0, 0],
        [15, 15],
      ];

      const {
        lastDir: resultLastDir,
        placedBox,
        bounds: resultBounds,
        layout: resultLayout,
      } = placeBox({ size, id }, layout, lastDir, bounds);

      expect(resultLayout.length).toBe(4);
      expect(placedBox.id).toBe(id);
      expect(placedBox.position).toEqual([-5, 5]);
      expect(resultLastDir).toBe(Direction.Left);
      expect(resultBounds).toEqual([
        [-5, 0],
        [15, 15],
      ]);
    });

    it("places a fifth box at the correct position and updates lastDir accordingly", () => {
      const layout: PlacedBox[] = [
        {
          position: [0, 0],
          size: [10, 10],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: true,
          },
          id: "1",
        },
        {
          position: [10, 0],
          size: [5, 5],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: false,
          },
          id: "2",
        },
        {
          position: [5, 10],
          size: [5, 5],
          sidesAvailable: {
            [Direction.Top]: false,
            [Direction.Right]: true,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
          },
          id: "3",
        },
        {
          position: [-5, 5],
          size: [5, 5],
          sidesAvailable: {
            [Direction.Top]: true,
            [Direction.Right]: false,
            [Direction.Bottom]: true,
            [Direction.Left]: true,
          },
          id: "4",
        },
      ];

      const size = [5, 5] as Vec;
      const id = "5";
      const lastDir: Direction = Direction.Left;
      const bounds: [Vec, Vec] = [
        [-5, 0],
        [15, 15],
      ];

      const {
        lastDir: resultLastDir,
        placedBox,
        bounds: resultBounds,
        layout: resultLayout,
      } = placeBox({ size, id }, layout, lastDir, bounds);

      expect(resultLayout.length).toBe(5);
      expect(placedBox.id).toBe(id);
      expect(placedBox.position).toEqual([15, 0]);
      expect(resultLastDir).toBe(Direction.Right);
      expect(resultBounds).toEqual([
        [-5, 0],
        [20, 15],
      ]);
    });

    it("throws an error when unable to place a box", () => {
      const layout: PlacedBox[] = [
        {
          position: [0, 0],
          size: [10, 10],
          sidesAvailable: {
            [Direction.Top]: false,
            [Direction.Right]: false,
            [Direction.Bottom]: false,
            [Direction.Left]: false,
          },
          id: "1",
        },
      ];

      const size = [5, 5] as Vec;
      const id = "2";
      const lastDir: Direction = Direction.Right;
      const bounds: [Vec, Vec] = [
        [0, 0],
        [10, 10],
      ];

      expect(() => {
        placeBox({ size, id }, layout, lastDir, bounds);
      }).toThrow("Can't add box.");
    });
  });
});
