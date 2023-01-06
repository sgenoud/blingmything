import { loadFont, drawText } from "replicad";
import { faceSize, addPatternToShape } from "./common";

const ROBOTO =
  "https://fonts.gstatic.com/s/roboto/v15/W5F8_SL0XFawnjxHGsZjJA.ttf";

export async function addText(
  shape,
  { faceIndex, text, angle, xShift, yShift, depth, fontSize }
) {
  await loadFont(ROBOTO);

  const face = shape.faces[faceIndex];

  let txt = drawText(text, { fontSize });
  const txtCenter = txt.boundingBox.center;

  if (face.orientation === "backward") {
    txt = txt.mirror([1, 0], txtCenter, "plane");
  }

  const { width, height } = faceSize(face);
  txt = txt
    .translate(-txtCenter[0], -txtCenter[1])
  if (angle) {
    txt = txt.rotate(angle);
  }
  txt = txt.translate(xShift + width / 2, yShift + height / 2);

  return addPatternToShape(shape, face, txt, depth, 1);
}
