import { addPatternToShape, faceSize } from "./common";

import { drawSVG } from "./parseSVG";

export async function addSVG(
  shape,
  { faceIndex, depth, svgString, width = 60, angle = 0, xShift = 0, yShift = 0 }
) {
  const face = shape.faces[faceIndex];

  let image = drawSVG(svgString, { width });
  const imgCenter = image.boundingBox.center;

  image = image.translate(-imgCenter[0], -imgCenter[1]);
  if (angle) {
    image = image.rotate(angle);
  }
  image = image.translate(xShift, yShift);

  const { width: faceWidth, height: faceHeight } = faceSize(face);
  image = image.translate(faceWidth / 2, faceHeight / 2);

  return addPatternToShape(shape, face, image, depth, 1);
}
