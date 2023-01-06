import { organiseBlueprints, Drawing } from "replicad";
import { DOMParser } from "xmldom";

import { fuseIntersectingBlueprints } from "./blueprintHelpers";
import {
  roundedRectangleBlueprint,
  SVGPathBlueprint,
  ellipseBlueprint,
} from "./svgShapes";

export function drawSVG(svg, { width } = {}) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "text/html");

  let blueprints = [];

  for (let path of Array.from(doc.getElementsByTagName("path"))) {
    let commands = path.getAttribute("d");
    const pathBlueprints = Array.from(SVGPathBlueprint(commands));
    blueprints.push(...pathBlueprints);
  }

  for (let path of Array.from(doc.getElementsByTagName("polygon"))) {
    let commands = path.getAttribute("points");
    blueprints = blueprints.concat(
      Array.from(SVGPathBlueprint(`M${commands}z`))
    );
  }

  for (let path of Array.from(doc.getElementsByTagName("rect"))) {
    const x = parseFloat(path.getAttribute("x")) || 0;
    const y = parseFloat(path.getAttribute("y")) || 0;
    const width = parseFloat(path.getAttribute("width")) || 0;
    const height = parseFloat(path.getAttribute("height")) || 0;

    let rx = parseFloat(path.getAttribute("rx")) || 0;
    let ry = parseFloat(path.getAttribute("ry")) || 0;

    blueprints.push(
      roundedRectangleBlueprint({
        x,
        y,
        rx,
        ry,
        width,
        height,
      })
    );
  }

  for (let path of Array.from(doc.getElementsByTagName("circle"))) {
    const cx = parseFloat(path.getAttribute("cx")) || 0;
    const cy = parseFloat(path.getAttribute("cy")) || 0;
    const r = parseFloat(path.getAttribute("r")) || 0;

    blueprints.push(ellipseBlueprint({ cx, cy, rx: r, ry: r }));
  }

  for (let path of Array.from(doc.getElementsByTagName("ellipse"))) {
    const cx = parseFloat(path.getAttribute("cx")) || 0;
    const cy = parseFloat(path.getAttribute("cy")) || 0;
    const rx = parseFloat(path.getAttribute("rx")) || 0;
    const ry = parseFloat(path.getAttribute("ry")) || 0;

    blueprints.push(ellipseBlueprint({ cx, cy, rx, ry }));
  }

  // TODO: handle transforms and stokes

  const fused = fuseIntersectingBlueprints(blueprints);
  let outBlueprints = organiseBlueprints(fused).mirror([1, 0], [0, 0], "plane");

  if (width) {
    const factor = width / outBlueprints.boundingBox.width;
    outBlueprints = outBlueprints.scale(
      factor,
      outBlueprints.boundingBox.center
    );
  }

  return new Drawing(outBlueprints);
}
