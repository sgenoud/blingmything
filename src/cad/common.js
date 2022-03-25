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
    vLen: Math.abs(vMax - vMin),
    uLen: Math.abs(uMax - uMin),
  };
};
