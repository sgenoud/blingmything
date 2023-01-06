import { drawFaceMargin } from "./common";

export async function addInset(shape, { faceIndex, depth, margin = 5 }) {
  const face = shape.faces[faceIndex];

  const innerBody = drawFaceMargin(face, margin)
    .sketchOnFace(face, "native")
    .extrude(depth);

  const newShape =
    depth > 0 ? shape.clone().fuse(innerBody) : shape.clone().cut(innerBody);
  return newShape;
}
