import { draw, Drawing } from "replicad";
import { range, faceSize, randomSeed, addPatternToShape } from "./common";
import { Delaunay } from "d3-delaunay";

function drawPolygonFromPoints(points) {
  const bps = draw(points[0]);
  points.slice(1).forEach((p) => bps.lineTo(p));
  return bps.close();
}

const voronoiPattern = ({
  cellCount,
  seed,
  width,
  height,
  padding,
  fillet,
}) => {
  const random = randomSeed(seed);

  const correctedMargin = -padding / 2 - 1;

  const points = range(cellCount).map(() => [
    random() * (width - 2 * correctedMargin) + correctedMargin,
    random() * (height - 2 * correctedMargin) + correctedMargin,
  ]);

  const polygons = Delaunay.from(points)
    .voronoi([
      correctedMargin,
      correctedMargin,
      width - correctedMargin,
      height - correctedMargin,
    ])
    .cellPolygons();

  let cells = new Drawing();
  for (let polygon of polygons) {
    const outerFace = drawPolygonFromPoints(polygon);
    cells = cells.fuse(
      outerFace.offset(-(padding / 2 + fillet)).offset(fillet)
    );
  }

  return cells;
};

export function addVoronoi(
  shape,
  {
    faceIndex,
    depth,
    padding = 2,
    margin = 2,
    cellCount = 10,
    seed = 1212,
    fillet = 0.5,
  }
) {
  const face = shape.faces[faceIndex];
  const { width, height } = faceSize(face);

  let pattern = voronoiPattern({
    cellCount,
    width,
    height,
    padding,
    fillet,
    seed,
  });

  return addPatternToShape(shape, face, pattern, depth, margin);
}
