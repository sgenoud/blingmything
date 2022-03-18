import {
  importSTEP,
  importSTL,
  loadFont,
  textBlueprints,
  Vector,
  Plane,
} from "replicad";
import moize from "moize";

const ROBOTO =
  "https://fonts.gstatic.com/s/roboto/v15/W5F8_SL0XFawnjxHGsZjJA.ttf";

const STATE = {
  originalShape: null,
  latestShape: null,
};

export async function importFile(file) {
  let shape;
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".step") || fileName.endsWith(".stp")) {
    shape = await importSTEP(file);
  } else if (fileName.endsWith(".stl")) {
    shape = await importSTL(file);
  }

  STATE.originalShape = shape;
  decorateShape.clear();

  return shape;
}

export async function writeOnFace(
  shape,
  { faceIndex, text, angle, xShift, yShift, depth, fontSize }
) {
  await loadFont(ROBOTO);

  const face = shape.faces[faceIndex];

  const origin = face.center;
  const normal = face.normalAt(origin);

  const v = new Vector([0, 0, 1]);
  let xd = v.cross(normal);
  if (xd.Length < 1e-8) {
    xd.delete();
    xd = new Vector([1, 0, 0]);
  }
  v.delete();

  const plane = new Plane(origin, xd, normal);

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
  STATE.latestShape = newShape;
  return newShape;
}

export const decorateShape = moize(
  async function decorateShape(changes) {
    if (!changes.length) return STATE.originalShape;
    const previousChanges = [...changes];
    const lastChange = previousChanges.pop();

    const shape = await decorateShape(previousChanges);

    return await writeOnFace(shape, lastChange);
  },
  { isDeepEqual: true, isPromise: true, maxSize: 20 }
);
