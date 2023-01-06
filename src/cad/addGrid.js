import { drawRoundedRectangle, Drawing } from "replicad";
import { range, faceSize, addPatternToShape } from "./common";

export async function addGrid(
  shape,
  { faceIndex, depth, width = 10, height = 10, padding = 2, margin = 2 }
) {
  const face = shape.faces[faceIndex];
  const { width: faceWidth, height: faceHeight } = faceSize(face);

  let lineLength =
    Math.ceil(Math.max(faceWidth, faceHeight) / (width + padding)) + 1;
  let linesCount =
    Math.ceil(Math.max(faceWidth, faceHeight) / (height + padding)) + 1;

  if (!(lineLength % 2)) lineLength += 1;
  if (!(linesCount % 2)) linesCount += 1;

  let pattern = new Drawing();

  range(lineLength).forEach((i) => {
    const shiftedXIndex = i - Math.floor(lineLength / 2);
    const xPosition = shiftedXIndex * (width + padding);
    range(linesCount).map((j) => {
      const shiftedYIndex = j - Math.floor(linesCount / 2);
      const yPosition = shiftedYIndex * (height + padding);
      pattern = pattern.fuse(
        drawRoundedRectangle(width, height).translate(xPosition, yPosition)
      );
    });
  });

  pattern = pattern.translate(faceWidth / 2, faceHeight / 2);

  return addPatternToShape(shape, face, pattern, depth, margin);
}
