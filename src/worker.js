import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";

import { setOC } from "replicad";
import { expose } from "comlink";

// We import our model as a simple function
import { importFile as loadShape, decorateShape as decorate } from "./cad";

// This is the logic to load the web assembly code into replicad
let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  console.log(OC.BOPAlgo_Options);

  setOC(OC);

  return true;
};
const started = init();

async function importFile(file) {
  await started;
  await loadShape(file);
}

async function decorateShape(config) {
  const shape = await decorate(config);
  return {
    faces: shape.mesh({ tolerance: 0.5, angularTolerance: 30 }),
    edges: shape.meshEdges({
      tolerance: 0.5,
      angularTolerance: 30,
    }),
  };
}

async function createSTL(config) {
  const shape = await decorate(config);
  return shape.blobSTL({
    tolerance: 0.01,
    angularTolerance: 30,
  });
}

async function createSTEP(config) {
  const shape = await decorate(config);
  return shape.blobSTEP();
}

const API = {
  importFile,
  decorateShape,
  createSTL,
  createSTEP,
};

expose(API);
export default API;
