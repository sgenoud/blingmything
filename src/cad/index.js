import {
  importSTEP,
  importSTL,
  sketchRectangle,
  EdgeFinder,
  FaceFinder,
} from "replicad";
import moize from "moize";

import { addText } from "./addText";
import { addInset } from "./addInset";
import { addHoneycomb } from "./addHoneycomb";
import { addGrid } from "./addGrid";

import { STATE, registerAsLatestShape } from "./state";

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

export async function startWithBox() {
  const shape = sketchRectangle(80, 120)
    .extrude(30)
    .fillet({
      radius: 5,
      filter: new EdgeFinder().inDirection("Z"),
    })
    .shell({
      thickness: 2,
      filter: new FaceFinder().inPlane("XY", 30),
    });

  STATE.originalShape = shape;
  decorateShape.clear();

  return shape;
}

export const decorateShape = moize(
  async function decorateShape(changes) {
    if (!changes.length) return STATE.originalShape;
    const previousChanges = [...changes];
    const lastChange = previousChanges.pop();

    const shape = await decorateShape(previousChanges);

    if (lastChange.decoration === "text")
      return registerAsLatestShape(await addText(shape, lastChange));
    if (lastChange.decoration === "inset")
      return registerAsLatestShape(await addInset(shape, lastChange));
    if (lastChange.decoration === "honeycomb")
      return registerAsLatestShape(await addHoneycomb(shape, lastChange));
    if (lastChange.decoration === "grid")
      return registerAsLatestShape(await addGrid(shape, lastChange));

    throw new Error(`Could not decorate with ${lastChange.decoration}`);
  },
  { isDeepEqual: true, isPromise: true, maxSize: 20 }
);
