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

export type Box = {
  size: Size;
  id: string;
};

export type BoundingBox = [Vec, Vec];

export type PlacedBox = {
  position: Vec;
  size: Size;
  sidesAvailable: { [dir in Direction]: boolean };
  id: string;
};
