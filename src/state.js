import { types, flow, getSnapshot } from "mobx-state-tree";
import { autorun } from "mobx";
import { UndoManager } from "mst-middlewares";

import api from "./api";
import UIState from "./ui-state";

const TextDecorationConfig = types
  .model("TextDecorationConfig", {
    decoration: types.literal("text"),
    faceIndex: types.number,
    depth: types.optional(types.number, -0.2),
    text: types.optional(types.string, ""),
    angle: types.optional(types.number, 0),
    xShift: types.optional(types.number, 0),
    yShift: types.optional(types.number, 0),
    fontSize: types.optional(types.number, 16),
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

const InsetDecorationConfig = types
  .model("InsetDecorationConfig", {
    decoration: types.literal("inset"),
    faceIndex: types.number,
    depth: types.optional(types.number, -0.2),
    margin: types.optional(types.number, 2),
  })
  .actions((self) => ({
    update({ depth, fontSize, margin }) {
      if (depth) self.depth = depth;
      if (fontSize) self.fontSize = fontSize;
      if (margin === 0 || margin) self.margin = margin;
    },
  }));

const HoneycombDecorationConfig = types
  .model("HoneycombDecorationConfig", {
    decoration: types.literal("honeycomb"),
    faceIndex: types.number,
    depth: types.optional(types.number, -0.2),
    margin: types.optional(types.number, 5),
    radius: types.optional(types.number, 10),
    padding: types.optional(types.number, 2),
  })
  .actions((self) => ({
    update({ depth, margin, radius, padding }) {
      if (depth) self.depth = depth;
      if (radius) self.radius = radius;
      if (padding) self.padding = padding;
      if (margin === 0 || margin) self.margin = margin;
    },
  }));

const GridDecorationConfig = types
  .model("GridDecorationConfig", {
    decoration: types.literal("grid"),
    faceIndex: types.number,
    depth: types.optional(types.number, -0.2),
    margin: types.optional(types.number, 4),
    width: types.optional(types.number, 16),
    height: types.optional(types.number, 16),
    padding: types.optional(types.number, 2),
  })
  .actions((self) => ({
    update({ depth, margin, width, height, padding }) {
      if (depth) self.depth = depth;
      if (height) self.height = height;
      if (width) self.width = width;
      if (padding) self.padding = padding;
      if (margin === 0 || margin) self.margin = margin;
    },
  }));

const SVGDecorationConfig = types
  .model("SVGDecorationConfig", {
    decoration: types.literal("svg"),
    faceIndex: types.number,
    depth: types.optional(types.number, -0.2),
    svgString: types.optional(types.string, ""),
    angle: types.optional(types.number, 0),
    xShift: types.optional(types.number, 0),
    yShift: types.optional(types.number, 0),
    width: types.optional(types.number, 60),
  })
  .actions((self) => ({
    loadFromFile() {},

    update({ angle, xShift, yShift, svgString, depth, width }) {
      if (angle === 0 || angle) self.angle = angle;
      if (xShift === 0 || xShift) self.xShift = xShift;
      if (yShift === 0 || yShift) self.yShift = yShift;
      if (depth) self.depth = depth;
      if (width) self.width = width;
      if (svgString === "" || svgString) self.svgString = svgString;
    },
  }));

const DecorationConfig = types.union(
  TextDecorationConfig,
  InsetDecorationConfig,
  HoneycombDecorationConfig,
  GridDecorationConfig,
  SVGDecorationConfig
);

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
    decorations: types.array(DecorationConfig),
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
    addDecoration(decorationType, decoration) {
      if (decorationType === "text") {
        self.decorations.push(
          TextDecorationConfig.create({
            decoration: "text",
            faceIndex: self.ui.faceSelected,
            ...decoration,
          })
        );
      }

      if (decorationType === "svg") {
        self.decorations.push(
          SVGDecorationConfig.create({
            decoration: "svg",
            faceIndex: self.ui.faceSelected,
            ...decoration,
          })
        );
      }

      if (decorationType === "inset") {
        self.decorations.push(
          InsetDecorationConfig.create({
            decoration: "inset",
            faceIndex: self.ui.faceSelected,
            ...decoration,
          })
        );
      }

      if (decorationType === "honeycomb") {
        self.decorations.push(
          HoneycombDecorationConfig.create({
            decoration: "honeycomb",
            faceIndex: self.ui.faceSelected,
            ...decoration,
          })
        );
      }

      if (decorationType === "grid") {
        self.decorations.push(
          GridDecorationConfig.create({
            decoration: "grid",
            faceIndex: self.ui.faceSelected,
            ...decoration,
          })
        );
      }

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

    startWithBox: flow(function* startWithBox() {
      self.processing = true;
      try {
        yield api.importBox();
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
