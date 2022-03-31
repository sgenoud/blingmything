import { sketchPolysides, sketchFaceOffset, compoundShapes } from "replicad";
import { range, faceSize, planeFromFace } from "./common";

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);
export async function addHoneycomb(
  shape,
  { faceIndex, depth, radius = 10, padding = 2, margin = 2 }
) {
  const face = shape.faces[faceIndex];
  const { vLen, uLen } = faceSize(face);
  const plane = planeFromFace(face);

  let lineLength = Math.ceil(Math.max(uLen, vLen) / (2 * radius + padding)) + 2;
  let linesCount =
    Math.ceil(Math.max(uLen, vLen) / ((2 * radius + padding) * COS30)) + 1;

  if (!(lineLength % 2)) {
    lineLength += 1;
  }

  if (!(linesCount % 2)) {
    linesCount += 1;
  }

  const cut = sketchPolysides(radius, 6, 0, { plane }).extrude(depth);

  const baseLine = compoundShapes(
    range(lineLength).map((i) => {
      const shiftedIndex = i - Math.floor(lineLength / 2);
      const position = shiftedIndex * (2 * radius + padding);
      return cut.clone().translate(plane.xDir.multiply(position));
    })
  );

  let structure = compoundShapes(
    range(linesCount).map((i) => {
      const shiftedIndex = i - Math.floor(linesCount / 2);
      let line = baseLine.clone();

      if (Math.abs(shiftedIndex) % 2) {
        line = line.translate(
          plane.xDir.multiply((2 * radius + padding) * SIN30)
        );
      }
      return line.translate(
        plane.yDir.multiply(shiftedIndex * (2 * radius + padding) * COS30)
      );
    })
  );

  const innerBody = sketchFaceOffset(face, -margin).extrude(depth);
  structure = innerBody.intersect(structure);

  const newShape =
    depth > 0 ? shape.clone().fuse(structure) : shape.clone().cut(structure);
  return newShape;
}
