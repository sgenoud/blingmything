import {
  importSTEP,
  importSTL,
  loadFont,
  textBlueprints,
  Vector,
  Plane,
  sketchPolysides,
  sketchFaceOffset,
  sketchRectangle,
  compoundShapes,
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

const planeFromFace = (face) => {
  const origin = face.center;
  const normal = face.normalAt(origin);

  const v = new Vector([0, 0, 1]);
  let xd = v.cross(normal);
  if (xd.Length < 1e-8) {
    xd.delete();
    xd = new Vector([1, 0, 0]);
  }
  v.delete();

  return new Plane(origin, xd, normal);
};

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
  STATE.latestShape = newShape;
  return newShape;
}

const range = (size) => [...Array(size).keys()];
const faceSize = (face) => {
  const { uMax, uMin, vMax, vMin } = face.UVBounds;

  return {
    vLen: Math.abs(vMax - vMin),
    uLen: Math.abs(uMax - uMin),
  };
};

export async function addInset(shape, { faceIndex, depth, margin = 5 }) {
  const face = shape.faces[faceIndex];

  const innerBody = sketchFaceOffset(face, -margin).extrude(depth);

  const newShape =
    depth > 0 ? shape.clone().fuse(innerBody) : shape.clone().cut(innerBody);
  STATE.latestShape = newShape;
  return newShape;
}

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
  STATE.latestShape = newShape;
  return newShape;
}

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
  STATE.latestShape = newShape;
  return newShape;
}

export const decorateShape = moize(
  async function decorateShape(changes) {
    if (!changes.length) return STATE.originalShape;
    const previousChanges = [...changes];
    const lastChange = previousChanges.pop();

    const shape = await decorateShape(previousChanges);

    if (lastChange.decoration === "text")
      return await addText(shape, lastChange);
    if (lastChange.decoration === "inset")
      return await addInset(shape, lastChange);
    if (lastChange.decoration === "honeycomb")
      return await addHoneycomb(shape, lastChange);
    if (lastChange.decoration === "grid")
      return await addGrid(shape, lastChange);

    throw new Error(`Could not decorate with ${lastChange.decoration}`);
  },
  { isDeepEqual: true, isPromise: true, maxSize: 20 }
);
