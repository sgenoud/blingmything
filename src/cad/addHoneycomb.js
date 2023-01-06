import { drawPolysides } from "replicad";
import { range, faceSize, mergeDrawings, addPatternToShape } from "./common";

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

export async function addHoneycomb(
  shape,
  { faceIndex, depth, radius = 10, padding = 2, margin = 2 }
) {
  const face = shape.faces[faceIndex];
  const { width, height } = faceSize(face);

  let lineLength =
    Math.ceil(Math.max(width, height) / (2 * radius + padding)) + 2;
  let linesCount =
    Math.ceil(Math.max(width, height) / ((2 * radius + padding) * COS30)) + 1;

  if (!(lineLength % 2)) {
    lineLength += 1;
  }

  if (!(linesCount % 2)) {
    linesCount += 1;
  }

  const cut = drawPolysides(radius, 6, 0);

  const baseLine = mergeDrawings(
    range(lineLength).map((i) => {
      const shiftedIndex = i - Math.floor(lineLength / 2);
      const position = shiftedIndex * (2 * radius + padding);
      return cut.clone().translate(position, 0);
    })
  );

  let pattern = mergeDrawings(
    range(linesCount).map((i) => {
      const shiftedIndex = i - Math.floor(linesCount / 2);
      let line = baseLine.clone();

      if (Math.abs(shiftedIndex) % 2) {
        line = line.translate((2 * radius + padding) * SIN30, 0);
      }
      return line.translate(0, shiftedIndex * (2 * radius + padding) * COS30);
    })
  );

  pattern = pattern.translate(width / 2, height / 2);

  return addPatternToShape(shape, face, pattern, depth, margin);
}
