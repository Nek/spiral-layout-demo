const testRectRect = (
  [x1, y1]: Vec,
  [w1, h1]: Vec,
  [x2, y2]: Vec,
  [w2, h2]: Vec,
) => {
  return !(x2 > x1 + w1 || x2 + w2 < x1 || y2 > y1 + h1 || y2 + h2 < y1);
};

const add2 = (a: Vec, b: Vec) => [a[0] + b[0], a[1] + b[1]] as Vec;
const sub2 = (a: Vec, b: Vec) => [a[0] - b[0], a[1] - b[1]] as Vec;

import {
  PlacedBox,
  Direction,
  Side,
  Size,
  Box,
  BoundingBox,
  Vec,
  AvailableSpace,
  Layout,
} from "./types";

// More the HORIZONTAL_TILT_FACTOR, more the images positionend to the right side of the screen
// const HORIZONTAL_TILT_FACTOR = 0.99
const HORIZONTAL_TILT_FACTOR = 0.5;
// More the ASPECT_RATIO_FACTOR, more the images positionend to make the layout more horizontal
const ASPECT_RATIO_FACTOR = 1.9;

const fitClamped = (val: number, min: number, max: number, minOut: number, maxOut: number) => {
  return (val - min) / (max - min) * (maxOut - minOut) + minOut;
};

/**
 * Converts a value to a tilted percentage value between -1 and 1.
 * @param {number} val - The input value to be converted.
 * @returns {number} The converted value as a tilted percentage between -1 and 1.
 */
const toTiltPercent = (val: number): number => fitClamped(val, 0, 1, -1, 1);

/**
 * Calculates the sides of a given box.
 * @param {PlacedBox} box - The box for which to calculate the sides.
 * @param {Direction} lastDir - The last direction in which the box was added to the layout.
 * @returns {[Direction, Side | undefined][]} An array of [Direction, Side | undefined] pairs, where each pair represents a direction and the corresponding side if it is available, or undefined if it is not.
 */
export const calculateSides = (
  box: PlacedBox,
  availableSpace: AvailableSpace,
  lastDir: Direction,
): [Direction, Side | undefined][] => {
  const res: [Direction, Side | undefined][] = [
    [Direction.Right, calculateSide(box, availableSpace, Direction.Right)],
    [Direction.Bottom, calculateSide(box, availableSpace, Direction.Bottom)],
    [Direction.Left, calculateSide(box, availableSpace, Direction.Left)],
    [Direction.Top, calculateSide(box, availableSpace, Direction.Top)],
  ];
  while (res[0][0] !== lastDir) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    res.unshift(res.pop()!);
  }
  return res;
};

/**
 * Creates a new `PlacedBox` with the specified `id` and `size`, positioned on the specified `side`
 * of the parent `PlacedBox` according to the specified `dir`.
 *
 * @param {Side} side - The side on which the box should be placed.
 * @param {Direction} dir - The direction in which the box should be placed.
 * @param {Size} size - The size of the box to be placed.
 * @param {string} id - The ID of the new box.
 *
 * @returns {PlacedBox} A new `PlacedBox` with the specified attributes.
 */
export const placeBoxOnSide = (
  side: Side,
  dir: Direction,
  size: Size,
): [PlacedBox, AvailableSpace] => {
  const [TL, BR] = side;
  const [W, H] = size;

  switch (dir) {
    case Direction.Right:
      return makePlacedBoxAndAvailableSpace(TL, size, dir);
    case Direction.Bottom:
      return makePlacedBoxAndAvailableSpace(
        [
          BR[0] -
            W +
            Math.round(size[0] * toTiltPercent(HORIZONTAL_TILT_FACTOR)),
          TL[1],
        ],
        size,
        dir,
      );
    case Direction.Left:
      return makePlacedBoxAndAvailableSpace(
        [TL[0] - W, BR[1] - H],
        size,
        dir,
      );
    case Direction.Top:
      return makePlacedBoxAndAvailableSpace(
        [
          BR[0] -
            W +
            Math.round(size[0] * toTiltPercent(HORIZONTAL_TILT_FACTOR)),
          TL[1] - H,
        ],
        size,
        dir,
      );
  }
};

const isBusy = (availableSpace: AvailableSpace) => {
  return Object.values(availableSpace).every(v => v === false);
};

/**
 * Places the given box into the layout, connecting it to an existing box if possible.
 *
 * @param {Box} box - The box to place into the layout.
 * @param {PlacedBox[]} layout - The existing layout of boxes.
 * @param {Direction} lastDir - The direction from which the last box was placed.
 * @param {[Vec, Vec]} bounds - The current bounds of the layout.
 * @throws {Error} If the box cannot be placed.
 * @returns {{ lastDir: Direction; placedBox: PlacedBox; bounds: [Vec, Vec] }} An object containing the new direction, the newly placed box, and the updated bounds of the layout.
 */
export const placeBox = (
  box: Box,
  layout: Layout,
  lastDir: Direction,
  bounds: BoundingBox,
): { lastDir: Direction; bounds: [Vec, Vec], layout: Layout } => {
  
  let newLayout = {
    placedBoxes: layout.placedBoxes.slice(),
    availableSpaces: new Map(layout.availableSpaces),
  }
  if (layout.placedBoxes.length === 0) {
    const id = layout.placedBoxes.length
    const [placedBox, availableSpace] = makePlacedBoxAndAvailableSpace([0, 0], box.size);
    newLayout.placedBoxes.push(placedBox);
    newLayout.availableSpaces.set(id, availableSpace);

    const [tlx, tly] = placedBox.position;
    const [brx, bry] = add2(placedBox.size, placedBox.position);

    return {
      lastDir,
      bounds: [
        [tlx, tly],
        [brx, bry],
      ],
      layout: newLayout,
    };
  }

  for (const [id, availableSpace] of newLayout.availableSpaces) {
    if (isBusy(availableSpace)) {
      newLayout.availableSpaces.delete(id);
      continue;
    }
    const placedBox = newLayout.placedBoxes[id];
    const sides = calculateSides(placedBox, availableSpace, lastDir);
    loopSides: for (const [dir, side] of sides) {
      if (side === undefined) continue;

      const [newBox, newAvailableSpace] = placeBoxOnSide(
        side,
        dir as Direction,
        box.size,
      );

      for (const collBox of layout.placedBoxes) {
        const collided = testRectRect(
          add2(newBox.position, [1, 1]),
          sub2(newBox.size, [1, 1]),
          add2(collBox.position, [1, 1]),
          sub2(collBox.size, [1, 1]),
        );
        if (collided) {
          continue loopSides;
        }
      }
      availableSpace[dir] = false;
      newLayout.placedBoxes.push(newBox);
      const newId = newLayout.placedBoxes.length - 1;
      newLayout.availableSpaces.set(newId, newAvailableSpace);

      const [tlx, tly] = newBox.position;
      const [brx, bry] = add2(newBox.size, newBox.position);
      const layoutBounds: [Vec, Vec] = [
        [Math.min(tlx, bounds[0][0]), Math.min(tly, bounds[0][1])],
        [Math.max(brx, bounds[1][0]), Math.max(bry, bounds[1][1])],
      ];
      return { lastDir: dir, bounds: layoutBounds, layout: newLayout };
    }
  }
  throw new Error("Can't add box.");
};

const ALL_SIDES_AVAILABLE = () => ({
  [Direction.Top]: true,
  [Direction.Right]: true,
  [Direction.Bottom]: true,
  [Direction.Left]: true,
});

const oppositeDirection = (dir: Direction) => {
  switch (dir) {
    case Direction.Right:
      return Direction.Left;
    case Direction.Bottom:
      return Direction.Top;
    case Direction.Left:
      return Direction.Right;
    case Direction.Top:
      return Direction.Bottom;
  }
};

export const makePlacedBoxAndAvailableSpace = (
  position: Vec,
  size: Vec,
  dir?: Direction,
): [PlacedBox, AvailableSpace] => {
  const availableSpace = ALL_SIDES_AVAILABLE();
  if (dir) {
    availableSpace[oppositeDirection(dir)] = false;
  }
  return [{
    position,
    size,
  }, availableSpace];
};

/**
 * Calculates the side of a given placed box in a specific direction.
 *
 * @param {PlacedBox} placedBox - The placed box to calculate the side of.
 * @param {Direction} direction - The direction of the side to calculate.
 * @returns {Side | undefined} The calculated side, or undefined if the side is not available.
 */
export const calculateSide = (
  placedBox: PlacedBox,
  availableSpace: AvailableSpace,
  direction: Direction,
): Side | undefined => {
  if (!availableSpace[direction]) return;
  const { position, size } = placedBox;
  switch (direction) {
    case Direction.Right:
      return [
        [position[0] + size[0], position[1]],
        [position[0] + size[0], position[1] + size[1]],
      ];
    case Direction.Bottom:
      return [
        [position[0], position[1] + size[1]],
        [position[0] + size[0], position[1] + size[1]],
      ];
    case Direction.Left:
      return [position, [position[0], position[1] + size[1]]];
    case Direction.Top:
      return [position, [position[0] + size[0], position[1]]];
  }
};
