import { sketchRectangle, compoundShapes, sketchFaceOffset } from "replicad";
import { range, faceSize, planeFromFace } from "./common";

export async function addGrid(
  shape,
  { faceIndex, depth, width = 10, height = 10, padding = 2, margin = 2 }
) {
  const face = shape.faces[faceIndex];
  const { vLen, uLen } = faceSize(face);
  const plane = planeFromFace(face);

  let lineLength = Math.ceil(Math.max(uLen, vLen) / (width + padding)) + 1;
  let linesCount = Math.ceil(Math.max(uLen, vLen) / (height + padding)) + 1;

  if (!(lineLength % 2)) lineLength += 1;
  if (!(linesCount % 2)) linesCount += 1;

  const cut = sketchRectangle(width, height, { plane }).extrude(depth);

  const baseLine = compoundShapes(
    range(lineLength).map((i) => {
      const shiftedIndex = i - Math.floor(lineLength / 2);
      const position = shiftedIndex * (width + padding);
      return cut.clone().translate(plane.xDir.multiply(position));
    })
  );

  let structure = compoundShapes(
    range(linesCount).map((i) => {
      const shiftedIndex = i - Math.floor(linesCount / 2);
      const position = shiftedIndex * (height + padding);
      return baseLine.clone().translate(plane.yDir.multiply(position));
    })
  );

  const innerBody = sketchFaceOffset(face, -margin).extrude(depth);
  structure = innerBody.intersect(structure);

  const newShape =
    depth > 0 ? shape.clone().fuse(structure) : shape.clone().cut(structure);
  return newShape;
}
