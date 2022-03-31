export const STATE = {
  originalShape: null,
  latestShape: null,
};

export const registerAsLatestShape = (shape) => {
  STATE.latestShape = shape;
  return shape;
};
