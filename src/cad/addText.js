import { loadFont, textBlueprints } from "replicad";
import { planeFromFace } from "./common";

const ROBOTO =
  "https://fonts.gstatic.com/s/roboto/v15/W5F8_SL0XFawnjxHGsZjJA.ttf";

export async function addText(
  shape,
  { faceIndex, text, angle, xShift, yShift, depth, fontSize }
) {
  await loadFont(ROBOTO);

  const face = shape.faces[faceIndex];
  const plane = planeFromFace(face);

  let txt = textBlueprints(text, { fontSize });
  const txtCenter = txt.boundingBox.center;

  txt = txt.translate(-txtCenter[0], -txtCenter[1]);
  if (angle) {
    txt = txt.rotate(angle);
  }
  txt = txt.translate(xShift, yShift);

  const txt3d = txt.sketchOnPlane(plane).extrude(depth);
  const newShape =
    depth > 0 ? shape.clone().fuse(txt3d) : shape.clone().cut(txt3d);
  return newShape;
}
