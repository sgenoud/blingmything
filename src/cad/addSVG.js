import { planeFromFace } from "./common";

import { SVGBlueprints } from "./parseSVG";

export async function addSVG(
  shape,
  { faceIndex, depth, svgString, width = 60, angle = 0, xShift = 0, yShift = 0 }
) {
  const face = shape.faces[faceIndex];
  const plane = planeFromFace(face);

  let image = SVGBlueprints(svgString, { width });
  const imgCenter = image.boundingBox.center;

  image = image.translate(-imgCenter[0], -imgCenter[1]);
  if (angle) {
    image = image.rotate(angle);
  }
  image = image.translate(xShift, yShift);

  const image3d = image.sketchOnPlane(plane).extrude(depth);

  const newShape =
    depth > 0 ? shape.clone().fuse(image3d) : shape.clone().cut(image3d);
  return newShape;
}
