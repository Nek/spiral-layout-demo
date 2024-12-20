export type Vec = [number, number];

export type Size = Vec;
export type Position = Vec;
export enum Direction {
  Right = "Right",
  Bottom = "Bottom",
  Left = "Left",
  Top = "Top",
}
export type Side = [Vec, Vec];

export interface Box {
  size: Size;
}

export type BoundingBox = [Vec, Vec];

export interface PlacedBox extends Box {
  position: Vec;
}

export interface AvailableSpace {
  [Direction.Top]: boolean;
  [Direction.Right]: boolean;
  [Direction.Bottom]: boolean;
  [Direction.Left]: boolean;
}

export interface Layout {
  placedBoxes: PlacedBox[];
  availableSpaces: Map<number, AvailableSpace>;
}
