import { types, flow, getSnapshot } from "mobx-state-tree";
import { autorun } from "mobx";
import { UndoManager } from "mst-middlewares";

import api from "./api";
import UIState from "./ui-state";

const TextDecorationConfig = types
  .model("TextDecorationConfig", {
    text: types.optional(types.string, ""),
    angle: types.optional(types.number, 0),
    xShift: types.optional(types.number, 0),
    yShift: types.optional(types.number, 0),
    depth: types.optional(types.number, -0.2),
    fontSize: types.optional(types.number, 16),
    faceIndex: types.number,
  })
  .actions((self) => ({
    update({ angle, xShift, yShift, text, depth, fontSize }) {
      if (angle === 0 || angle) self.angle = angle;
      if (xShift === 0 || xShift) self.xShift = xShift;
      if (yShift === 0 || yShift) self.yShift = yShift;
      if (depth) self.depth = depth;
      if (fontSize) self.fontSize = fontSize;
      if (text === "" || text) self.text = text;
    },
  }));

const inSeries = (func) => {
  let refresh;
  let currentlyRunning = false;

  return async function () {
    if (currentlyRunning) {
      refresh = true;
      return;
    }
    currentlyRunning = true;

    while (true) {
      refresh = false;
      await func();

      if (!refresh) break;
    }

    currentlyRunning = false;
  };
};

const AppState = types
  .model("AppState", {
    decorations: types.array(TextDecorationConfig),
    ui: UIState,
    history: types.optional(UndoManager, {}),
  })
  .views((self) => ({
    get currentValues() {
      return getSnapshot(self.decorations);
    },

    get previousDecoration() {
      return self.decorations[self.decorations.length - 1];
    },

    get activeDecoration() {
      if (self.ui.faceSelectionMode || self.ui.faceSelected) return null;
      return self.previousDecoration;
    },
  }))
  .actions((self) => ({
    addDecoration(decoration) {
      self.decorations.push(
        TextDecorationConfig.create({
          faceIndex: self.ui.faceSelected,
          ...decoration,
        })
      );
      self.ui.deselectFace();
    },
  }))
  .volatile(() => ({
    currentMesh: null,
    processing: false,
    baseShapeLoaded: false,
    baseShapeReady: false,
    error: false,
  }))
  .actions((self) => ({
    loadFile: flow(function* loadFile(newFile) {
      if (!newFile) return;
      self.processing = true;
      try {
        yield api.importFile(newFile);
        self.baseShapeReady = true;
        self.error = false;
      } catch (e) {
        console.error(e);
        self.error = true;
      }
      self.processing = false;
    }),

    decorateShape: flow(function* decorateShape() {
      self.processing = true;
      try {
        const mesh = yield api.decorateShape(self.currentValues);
        self.currentMesh = mesh;
        self.error = false;
        self.baseShapeLoaded = true;
      } catch (e) {
        console.error(e);
        self.error = true;
      }
      self.processing = false;
    }),
  }))
  .extend((self) => {
    let disposer = null;

    const decorate = inSeries(self.decorateShape);

    const run = async () => {
      self.currentValues;
      if (!self.baseShapeReady) return;
      await decorate();
    };

    return {
      actions: {
        afterCreate() {
          disposer = autorun(run, { delay: 300 });
        },

        afterDestroy() {
          if (disposer) disposer();
        },
      },
    };
  });

export default AppState;
