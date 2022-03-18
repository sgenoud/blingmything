import { types, getRoot } from "mobx-state-tree";

export default types.optional(
  types
    .model("UIState", {
      faceSelectionMode: types.optional(types.boolean, true),
      faceSelected: types.maybe(types.number),
    })
    .actions((self) => {
      const history = getRoot(self).history;
      return {
        toggleFaceSelection() {
          history.withoutUndo(() => {
            self.faceSelectionMode = !self.faceSelectionMode;
          });
        },
        disableFaceSelection() {
          history.withoutUndo(() => {
            self.faceSelectionMode = false;
          });
        },
        enableFaceSelection() {
          history.withoutUndo(() => {
            self.faceSelectionMode = true;
          });
        },
        selectFace(newFace) {
          history.withoutUndo(() => {
            self.faceSelected = newFace;
            self.faceSelectionMode = false;
          });
        },
        deselectFace() {
          history.withoutUndo(() => {
            self.faceSelected = undefined;
          });
        },
        newSelection() {
          history.withoutUndo(() => {
            self.faceSelected = undefined;
            self.faceSelectionMode = true;
          });
        },
      };
    }),
  {}
);
