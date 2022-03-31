import { getOC, Blueprint } from "replicad";

const hc = (curve) => {
  const oc = getOC();
  return new oc.Handle_Geom2d_Curve_2(curve);
};

const pnt = ([x, y]) => {
  const oc = getOC();
  return new oc.gp_Pnt2d_3(x, y);
};

const pntEq = ([x0, y0], [x, y]) => {
  return Math.abs(x0 - x) < 1e-9 && Math.abs(y0 - y) < 1e-9;
};

const curveMidPoint = (curve) => {
  // (lp - fp) / 2 + fp
  const midParameter = (curve.LastParameter() + curve.FirstParameter()) / 2;
  const midPoint = curve.Value(midParameter);
  return [midPoint.X(), midPoint.Y()];
};

function zip(arrays) {
  return arrays[0].map(function (_, i) {
    return arrays.map(function (array) {
      return array[i];
    });
  });
}

/* Split a curve into segments separated by points */
/* The points need to be on the curve */
const splitCurve = (curve, points) => {
  const oc = getOC();

  let parameters = points.map((point) => {
    const projector = new oc.Geom2dAPI_ProjectPointOnCurve_2(
      pnt(point),
      hc(curve)
    );

    if (projector.LowerDistance() > 1e-6) {
      throw new Error("Point not on curve");
    }
    return projector.LowerDistanceParameter();
  });

  // We only split on each point once
  parameters = Array.from(new Set(parameters)).sort((a, b) => a - b);
  const firstParam = curve.FirstParameter();
  const lastParam = curve.LastParameter();

  if (firstParam > lastParam) parameters.reverse();

  // We do not split again on the start and end
  if (parameters[0] === firstParam) parameters = parameters.slice(1);
  if (parameters[parameters.length] === lastParam)
    parameters = parameters.slice(0, -1);

  if (!parameters.length) return curve;

  return zip([
    [curve.FirstParameter(), ...parameters],
    [...parameters, curve.LastParameter()],
  ]).map(
    ([first, last]) =>
      new oc.Geom2d_TrimmedCurve(hc(curve), first, last, true, true)
  );
};

const firstPoint = (curve) => {
  const fp = curve.Value(curve.FirstParameter());
  return [fp.X(), fp.Y()];
};

const lastPoint = (curve) => {
  const lp = curve.Value(curve.LastParameter());
  return [lp.X(), lp.Y()];
};

const rotateToStartAt = (curves, point) => {
  const startIndex = curves.findIndex((curve) => {
    return pntEq(point, firstPoint(curve));
  });

  const start = curves.slice(0, startIndex);
  const end = curves.slice(startIndex);

  return end.concat(start);
};

function* intersectedSegments(curves, allIntersections) {
  const endsAtIntersection = (curve) => {
    return !!allIntersections.find((intersection) => {
      return pntEq(intersection, lastPoint(curve));
    });
  };

  let currentCurves = [];
  for (let curve of curves) {
    currentCurves.push(curve);
    if (endsAtIntersection(curve)) {
      yield currentCurves;
      currentCurves = [];
    }
  }
}

function* pointsIteration(intersector) {
  const nPoints = intersector.NbPoints();
  if (!nPoints) return;

  for (let i = 1; i <= nPoints; i++) {
    const point = intersector.Point(i);
    yield [point.X(), point.Y()];
  }
}

/* When two shape intersect we cut them into segments between the intersection
 * points.
 *
 * This function returs the list of segments that have the same start and end
 * at the same intersection points.
 *
 * The function assumes that the blueprints are closed
 */
export function blueprintsIntersectionSegments(first, second) {
  const oc = getOC();
  const intersector = new oc.Geom2dAPI_InterCurveCurve_1();

  // For each curve of each blueprint we figure out where the intersection
  // points are.
  const allIntersections = [];
  const firstCurvePoints = new Array(first.curves.length).fill(0).map(() => []);
  const secondCurvePoints = new Array(second.curves.length)
    .fill(0)
    .map(() => []);

  first.curves.forEach((thisCurve, firstIndex) => {
    second.curves.forEach((otherCurve, secondIndex) => {
      intersector.Init_1(hc(thisCurve), hc(otherCurve), 1e-3);

      const intersections = Array.from(pointsIteration(intersector));
      allIntersections.push(...intersections);
      firstCurvePoints[firstIndex].push(...intersections);
      secondCurvePoints[secondIndex].push(...intersections);
    });
  });

  if (!allIntersections.length) throw new Error("Blueprints do not intersect");

  // We further split the curves at the intersections
  const cutCurve = ([curve, intersections]) => {
    if (!intersections.length) return curve;
    return splitCurve(curve, intersections);
  };
  let firstCurveSegments = zip([first.curves, firstCurvePoints]).flatMap(
    cutCurve
  );
  let secondCurveSegments = zip([second.curves, secondCurvePoints]).flatMap(
    cutCurve
  );

  // We align the beginning of the curves
  firstCurveSegments = rotateToStartAt(firstCurveSegments, allIntersections[0]);
  secondCurveSegments = rotateToStartAt(
    secondCurveSegments,
    allIntersections[0]
  );

  // We group curves in segments
  const firstIntersectedSegments = Array.from(
    intersectedSegments(firstCurveSegments, allIntersections)
  );
  const secondIntersectedSegments = Array.from(
    intersectedSegments(secondCurveSegments, allIntersections)
  );

  if (
    !pntEq(
      lastPoint(secondIntersectedSegments[0][0]),
      lastPoint(firstIntersectedSegments[0][0])
    )
  ) {
    secondIntersectedSegments.reverse();
    secondIntersectedSegments.forEach((segment) => {
      segment.reverse();
      segment.forEach((curve) => curve.Reverse());
    });
  }

  return zip([firstIntersectedSegments, secondIntersectedSegments]);
}

const fuseBlueprints = (first, second) => {
  // TODO: handle overlapping curves
  const segments = blueprintsIntersectionSegments(first, second);

  return new Blueprint(
    segments.flatMap(([firstSegment, secondSegment]) => {
      const segments = [];

      const firstSegmentPoint = curveMidPoint(firstSegment[0]);
      if (!second.isInside(firstSegmentPoint)) {
        segments.push(...firstSegment);
      }

      const secondSegmentPoint = curveMidPoint(secondSegment[0]);
      if (!first.isInside(secondSegmentPoint)) {
        // When there are only two segments we cannot know if we are in the
        // same until here - so it is possible that they are mismatched.
        if (segments.length) {
          secondSegment.reverse();
          secondSegment.forEach((s) => s.Reverse());
        }
        segments.push(...secondSegment);
      }

      return segments;
    })
  );
};

export function blueprintsIntersect(first, second) {
  const oc = getOC();
  const intersector = new oc.Geom2dAPI_InterCurveCurve_1();

  for (const thisCurve of first.curves) {
    for (const otherCurve of second.curves) {
      intersector.Init_1(
        new oc.Handle_Geom2d_Curve_2(thisCurve),
        new oc.Handle_Geom2d_Curve_2(otherCurve),
        1e-6
      );
      if (intersector.NbPoints()) return true;
    }
  }
  return false;
}

const curveInfo = (curve) => {
  const fp = curve.Value(curve.FirstParameter());
  const firstPoint = [fp.X(), fp.Y()];

  const lp = curve.Value(curve.LastParameter());
  const lastPoint = [lp.X(), lp.Y()];

  return { firstPoint, lastPoint };
};

const formatPoint = ([x, y]) => {
  return `(${x.toFixed(2)}, ${y.toFixed(2)})`;
};

export const curvesInfo = (curves) => {
  return (
    curves
      .map((c) => {
        const { firstPoint, lastPoint } = curveInfo(c);
        return `${formatPoint(firstPoint)} - ${formatPoint(lastPoint)}`;
      })
      .join("\n") + "\n --- \n"
  );
};

export const fuseIntersectingBlueprints = (blueprints) => {
  const fused = new Map();

  const output = [];

  blueprints.forEach((inputBlueprint, i) => {
    let savedBlueprint = { current: inputBlueprint };

    if (fused.has(i)) {
      savedBlueprint = fused.get(i);
    } else {
      output.push(savedBlueprint);
    }

    let blueprint = savedBlueprint.current;

    blueprints.slice(i + 1).forEach((inputOtherBlueprint, j) => {
      const currentIndex = i + j + 1;
      let otherBlueprint = inputOtherBlueprint;
      let otherIsFused = false;

      if (fused.has(currentIndex)) {
        otherBlueprint = fused.get(currentIndex).current;
        otherIsFused = true;
      }
      if (blueprint.boundingBox.isOut(otherBlueprint.boundingBox)) return;
      if (!blueprintsIntersect(blueprint, otherBlueprint)) return;

      savedBlueprint.current = fuseBlueprints(blueprint, otherBlueprint);
      if (otherIsFused) {
        fused.get(currentIndex).current = false;
      }
      fused.set(currentIndex, savedBlueprint);
    });
  });

  return output.map(({ current }) => current).filter((a) => a);
};
