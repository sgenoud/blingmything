import { BlueprintSketcher } from "replicad";
import { parsePath, absolutize } from "path-data-parser";

export const roundedRectangleBlueprint = ({
  x = 0,
  y = 0,
  rx: inputRx = 0,
  ry: inputRy = 0,
  width,
  height,
}) => {
  let rx = Math.min(inputRx, width / 2);
  let ry = Math.min(inputRy, height / 2);

  const withRadius = rx && ry;
  if (!withRadius) {
    rx = 0;
    ry = 0;
  }

  const sk = new BlueprintSketcher([x + width / 2, y]);
  if (rx < width / 2) {
    sk.hLine(width / 2 - rx);
  }
  if (withRadius) {
    sk.ellipse(rx, ry, rx, ry, 0, false, true);
  }
  if (ry < height / 2) {
    sk.vLine(height - 2 * ry);
  }
  if (withRadius) {
    sk.ellipse(-rx, ry, rx, ry, 0, false, true);
  }
  return sk.hLine(-width / 2 + rx).closeWithMirror();
};

export const ellipseBlueprint = ({ cx = 0, cy = 0, rx, ry }) => {
  const sk = new BlueprintSketcher([cx - rx, cy]);
  sk.halfEllipse(2 * rx, 0, ry, false, true);
  sk.halfEllipse(-2 * rx, 0, ry, false, true);
  return sk.close();
};

const parseArgs = (command, previousPoint, previousControls) => {
  let p;
  let control1 = null;
  let control2 = null;

  if (command.key === "M") {
    const [x, y] = command.data;
    p = [x, y];
    return { p };
  }

  if (command.key === "H") {
    const [x] = command.data;
    p = [x, previousPoint?.[1] || 0];
    return { p };
  }

  if (command.key === "V") {
    const [y] = command.data;
    p = [previousPoint?.[0] || 0, y];
    return { p };
  }

  if (command.key === "L") {
    const [x, y] = command.data;
    p = [x, y];
    return { p };
  }

  if (command.key === "C") {
    const [x1, y1, x2, y2, x, y] = command.data;
    p = [x, y];
    control1 = [x1, y1];
    control2 = [x2, y2];

    return {
      p,
      control1,
      control2,
    };
  }

  if (command.key === "S") {
    const [x1, y1, x, y] = command.data;
    p = [x, y];
    control2 = [x1, y1];

    control1 = previousPoint;
    if (previousControls.control2) {
      const pp = previousPoint;
      control1 = [
        pp[0] + (pp[0] - previousControls.control2[0]),
        pp[1] + (pp[1] - previousControls.control2[1]),
      ];
    }

    return {
      p,
      control1,
      control2,
    };
  }

  if (command.key === "Q") {
    const [x1, y1, x, y] = command.data;
    p = [x, y];
    control1 = [x1, y1];

    return {
      p,
      control1,
    };
  }

  if (command.key === "T") {
    const [x, y] = command.data;
    p = [x, y];

    control1 = previousPoint;
    if (previousControls.control1 && !previousControls.control2) {
      const pp = previousPoint;
      control1 = [
        pp[0] + (pp[0] - previousControls.control1[0]),
        pp[1] + (pp[1] - previousControls.control1[1]),
      ];
    }
  }

  if (command.key === "A") {
    const [rx, ry, xAxisRotation = 0, largeArc = 0, sweepFlag = 0, x, y] =
      command.data;
    p = [x, y];

    // The radius can be defined as smaller than what is needed. We need to fix
    // it in that case.
    const distance = Math.sqrt(
      (previousPoint[0] - x) ** 2 + (previousPoint[1] - y) ** 2
    );
    const bigRadius = Math.max(rx, ry);
    let a = rx;
    let b = ry;

    if (bigRadius < distance / 2) {
      const ratio = distance / 2 / bigRadius;
      a = rx * ratio;
      b = ry * ratio;
    }

    return {
      p,
      arcConfig: [a, b, xAxisRotation, !!largeArc, !!sweepFlag],
    };
  }
};

export const SVGPathBlueprint = function* (SVGPath) {
  const commands = absolutize(parsePath(SVGPath));

  let sk = null;
  let lastPoint = null;
  let lastControls = { control1: null, control2: null };

  for (const command of commands) {
    if (command.key === "Z") {
      if (sk) yield sk.close();
      sk = null;
      continue;
    }

    const {
      p,
      control1,
      control2,
      arcConfig = [],
    } = parseArgs(command, lastPoint, lastControls);

    if (command.key === "M") {
      if (sk) {
        yield sk.done();
      }

      sk = new BlueprintSketcher(p);
      lastPoint = p;
      continue;
    }

    // We do not draw line of length 0
    if (
      lastPoint &&
      Math.abs(p[0] - lastPoint[0]) < 1e-9 &&
      Math.abs(p[1] - lastPoint[1]) < 1e-9
    ) {
      lastPoint = p;
      lastControls = { control1, control2 };
      continue;
    }

    if (command.key === "L" || command.key === "H" || command.key === "V") {
      sk?.lineTo(p);
    }

    if (command.key === "C" || command.key === "S") {
      sk?.cubicBezierCurveTo(p, control1, control2);
    }

    if (command.key === "Q" || command.key === "T") {
      sk?.quadraticBezierCurveTo(p, control1);
    }

    if (command.key === "A") {
      sk?.ellipseTo(p, ...arcConfig);
    }

    lastPoint = p;
    lastControls = { control1, control2 };
  }

  if (sk) yield sk.done();
};
