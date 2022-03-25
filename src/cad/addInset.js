import { sketchFaceOffset } from "replicad";

export async function addInset(shape, { faceIndex, depth, margin = 5 }) {
  const face = shape.faces[faceIndex];

  const innerBody = sketchFaceOffset(face, -margin).extrude(depth);

  const newShape =
    depth > 0 ? shape.clone().fuse(innerBody) : shape.clone().cut(innerBody);
  return newShape;
}
