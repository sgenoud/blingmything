import {  GCWithScope, getOC, drawFaceOutline } from "replicad";

export const range = (size) => [...Array(size).keys()];

export const mergeDrawings = (drawings) => {
  let merged = drawings[0];

  drawings.slice(1).forEach((d) => {
    merged = merged.fuse(d);
  });

  return merged;
};

const cylidreRadius = (face) => {
  const oc = getOC();
  const r = GCWithScope();
  let geomSurf = r(oc.BRep_Tool.Surface_2(face.wrapped));
  const cylinder = r(geomSurf.get().Cylinder());
  return cylinder.Radius();
};

export const faceSize = (face) => {
  const { uMax, uMin, vMax, vMin } = face.UVBounds;
  const vLen = Math.abs(vMax - vMin);
  const uLen = Math.abs(uMax - uMin);

  let width = uLen;
  let height = vLen;

  if (face.geomType === "CYLINDRE") {
    width = width * cylidreRadius(face);
  }

  return {
    uMax,
    uMin,
    vMax,
    vMin,
    vLen,
    uLen,
    width,
    height,
  };
};

export const randomSeed = (seed) => {
  let a = seed;
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const drawFaceMargin = (face, margin) => {
  const { width, uLen, height, vLen } = faceSize(face);

  const xStretch = width / uLen;
  const yStretch = height / vLen;

  let outline = drawFaceOutline(face);
  if (xStretch !== 1) {
    outline = outline.stretch(xStretch, [0, 1]);
  }
  if (yStretch !== 1) {
    outline = outline.stretch(yStretch, [1, 0]);
  }
  outline = outline.offset(-margin);
  if (yStretch !== 1) {
    outline = outline.stretch(1 / yStretch, [1, 0]);
  }
  if (xStretch !== 1) {
    outline = outline.stretch(1 / xStretch, [0, 1]);
  }
  return outline;
};

export const addPatternToShape = (shape, face, pattern, depth, margin) => {
  const { vLen, uLen, uMin, vMin, width, height } = faceSize(face);

  const yScaleFactor = vLen / height;
  const xScaleFactor = uLen / width;

  const outline = drawFaceMargin(face, margin);

  if (xScaleFactor !== 1) {
    pattern = pattern.stretch(xScaleFactor, [0, 1]);
  }
  if (yScaleFactor !== 1) {
    pattern = pattern.stretch(yScaleFactor, [1, 0]);
  }
  pattern = pattern.translate([uMin, vMin]);

  const cutPattern = outline.intersect(pattern);
  const cleanedPattern = cutPattern.sketchOnFace(face, "native").extrude(depth);

  const newShape =
    depth > 0 ? shape.clone().fuse(cleanedPattern) : shape.clone().cut(cleanedPattern);
  return newShape;
};
