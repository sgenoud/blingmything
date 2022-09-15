import { draw, sketchFaceOffset, compoundShapes } from "replicad";
import { range, faceSize, planeFromFace, randomSeed } from "./common";
import { Delaunay } from "d3-delaunay";

function drawPolygonFromPoints(points) {
  const bps = draw(points[0]);
  points.slice(1).forEach((p) => bps.lineTo(p));
  return bps.close();
}

export function addVoronoi(
  shape,
  { faceIndex, depth, padding = 2, margin = 2, cellCount = 10, seed = 1212 }
) {
  const face = shape.faces[faceIndex];
  const { vLen, uLen, uMin, vMin, uMax, vMax } = faceSize(face);
  const plane = planeFromFace(face);

  const random = randomSeed(seed);

  const points = range(cellCount).map(() => [
    random() * uLen + uMin,
    random() * vLen + vMin,
  ]);

  const polygons = Delaunay.from(points)
    .voronoi([uMin, vMin, uMax, vMax])
    .cellPolygons();

  const cells = [];
  for (let polygon of polygons) {
    const outerFace = drawPolygonFromPoints(polygon)
      .sketchOnPlane(plane)
      .face();

    cells.push(sketchFaceOffset(outerFace, -padding / 2).extrude(depth));
  }

  let structure = compoundShapes(cells);

  const innerBody = sketchFaceOffset(face, -margin).extrude(depth);
  structure = innerBody.intersect(structure);

  const newShape =
    depth > 0 ? shape.clone().fuse(structure) : shape.clone().cut(structure);
  return newShape;
}
