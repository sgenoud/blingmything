import { Vector, Plane } from "replicad";

export const planeFromFace = (face) => {
  const origin = face.center;
  const normal = face.normalAt(origin);

  const v = new Vector([0, 0, 1]);
  let xd = v.cross(normal);
  if (xd.Length < 1e-8) {
    xd.delete();
    xd = new Vector([1, 0, 0]);
  }
  v.delete();

  return new Plane(origin, xd, normal);
};

export const range = (size) => [...Array(size).keys()];
export const faceSize = (face) => {
  const { uMax, uMin, vMax, vMin } = face.UVBounds;

  return {
    uMax,
    uMin,
    vMax,
    vMin,
    vLen: Math.abs(vMax - vMin),
    uLen: Math.abs(uMax - uMin),
  };
};

export const randomSeed = (seed) => {
let a = seed;
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
