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
  lastDir: Direction,
): [Direction, Side | undefined][] => {
  const res: [Direction, Side | undefined][] = [
    [Direction.Right, calculateSide(box, Direction.Right)],
    [Direction.Bottom, calculateSide(box, Direction.Bottom)],
    [Direction.Left, calculateSide(box, Direction.Left)],
    [Direction.Top, calculateSide(box, Direction.Top)],
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
export const makePlacedBoxOnSide = (
  side: Side,
  dir: Direction,
  size: Size,
  id: string,
  currentBounds: BoundingBox,
): PlacedBox => {
  const [TL, BR] = side;
  const [W, H] = size;

  // The block tries to make the layout to keep the specified aspect ratio
  // by forcing the images to be positioned on the right or left side of the layout
  if (getBoundingBoxAspectRatio(currentBounds) < ASPECT_RATIO_FACTOR) {
    if (dir === Direction.Top) {
      dir = Direction.Right;
    } else if (dir === Direction.Bottom) {
      dir = Direction.Left;
    }
  }

  switch (dir) {
    case Direction.Right:
      return makePlacedBox(Direction.Right, TL, size, id);
    case Direction.Bottom:
      return makePlacedBox(
        Direction.Bottom,
        [
          BR[0] -
            W +
            Math.round(size[0] * toTiltPercent(HORIZONTAL_TILT_FACTOR)),
          TL[1],
        ],
        size,
        id,
      );
    case Direction.Left:
      return makePlacedBox(Direction.Left, [TL[0] - W, BR[1] - H], size, id);
    case Direction.Top:
      return makePlacedBox(
        Direction.Top,
        [
          BR[0] -
            W +
            Math.round(size[0] * toTiltPercent(HORIZONTAL_TILT_FACTOR)),
          TL[1] - H,
        ],
        size,
        id,
      );
  }
};

const getBoundingBoxAspectRatio = (boundingBox: BoundingBox) => {
  const [tl, br] = boundingBox;
  const [w, h] = sub2(br, tl);
  return w / h;
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
  layout: PlacedBox[],
  lastDir: Direction,
  bounds: BoundingBox,
): { lastDir: Direction; placedBox: PlacedBox; bounds: [Vec, Vec], layout: PlacedBox[] } => {
  let newLayout = layout.slice()
  if (layout.length === 0) {
    const placedBox = makePlacedBox(lastDir, [0, 0], box.size, box.id);
    newLayout.push(placedBox);

    const [tlx, tly] = placedBox.position;
    const [brx, bry] = add2(placedBox.size, placedBox.position);

    return {
      lastDir,
      placedBox: placedBox,
      bounds: [
        [tlx, tly],
        [brx, bry],
      ],
      layout: newLayout,
    };
  }

  for (const placedBox of layout) {
    const sides = calculateSides(placedBox, lastDir);
    loopSides: for (const [dir, side] of sides) {
      if (side === undefined) continue;

      // current bounds is important to make the layout to keep the specified aspect ratio
      const newBox = makePlacedBoxOnSide(
        side,
        dir as Direction,
        box.size,
        box.id,
        bounds,
      );

      for (const collBox of layout) {
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
      placedBox.sidesAvailable[dir] = false;
      newLayout.push(newBox);
      const [tlx, tly] = newBox.position;
      const [brx, bry] = add2(newBox.size, newBox.position);
      const layoutBounds: [Vec, Vec] = [
        [Math.min(tlx, bounds[0][0]), Math.min(tly, bounds[0][1])],
        [Math.max(brx, bounds[1][0]), Math.max(bry, bounds[1][1])],
      ];
      return { lastDir: dir, placedBox: newBox, bounds: layoutBounds, layout: newLayout };
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

export const makePlacedBox = (
  dir: Direction,
  position: Vec,
  size: Vec,
  id: string,
): PlacedBox => {
  return {
    position,
    size,
    sidesAvailable: {
      ...ALL_SIDES_AVAILABLE(),
      [oppositeDirection(dir)]: false,
    },
    id,
  };
};

export const connectBoxes = (
  parent: PlacedBox,
  child: PlacedBox,
  direction: Direction,
) => {
  switch (direction) {
    case Direction.Top:
      parent.sidesAvailable[Direction.Top] = false;
      child.sidesAvailable[Direction.Bottom] = false;
      break;
    case Direction.Right:
      parent.sidesAvailable[Direction.Right] = false;
      child.sidesAvailable[Direction.Left] = false;
      break;
    case Direction.Bottom:
      parent.sidesAvailable[Direction.Bottom] = false;
      child.sidesAvailable[Direction.Top] = false;
      break;
    case Direction.Left:
      parent.sidesAvailable[Direction.Left] = false;
      child.sidesAvailable[Direction.Right] = false;
      break;
  }
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
  direction: Direction,
): Side | undefined => {
  if (!placedBox.sidesAvailable[direction]) return;
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

type Bounds = [Vec, Vec];

/**
 *  Places all the boxes in the given array into a layout.
 * @param {Box[]} boxes - The boxes to place into the layout.
 * @returns {[PlacedBox[], Bounds]} An array containing the placed boxes
 * and the bounds([topLeft, bottomRight]) of the layout.
 */
const placeAllBoxes = (boxes: Box[]): [PlacedBox[], Bounds] => {
  const layout: PlacedBox[] = [];
  let layoutBounds: [Vec, Vec] = [
    [0, 0],
    [0, 0],
  ];
  let lastDir: Direction = Direction.Right;
  let box = boxes.shift();
  while (box) {
    const { lastDir: newLastDir, bounds } = placeBox(
      box,
      layout,
      lastDir,
      layoutBounds,
    );
    layoutBounds = bounds;
    lastDir = newLastDir;
    box = boxes.shift();
  }

  return [layout, layoutBounds];
};

export default placeAllBoxes;
