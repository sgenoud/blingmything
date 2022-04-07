import { getOC, Blueprint } from "replicad";

const pntEq = ([x0, y0], [x, y]) => {
  return Math.abs(x0 - x) < 1e-9 && Math.abs(y0 - y) < 1e-9;
};

const curveMidPoint = (curve) => {
  // (lp - fp) / 2 + fp
  const midParameter = (curve.lastParameter + curve.firstParameter) / 2;
  return curve.value(midParameter);
};

function zip(arrays) {
  return arrays[0].map(function (_, i) {
    return arrays.map(function (array) {
      return array[i];
    });
  });
}

const rotateToStartAt = (curves, point) => {
  const startIndex = curves.findIndex((curve) => {
    return pntEq(point, curve.firstPoint);
  });

  const start = curves.slice(0, startIndex);
  const end = curves.slice(startIndex);

  return end.concat(start);
};

function* intersectedSegments(curves, allIntersections) {
  const endsAtIntersection = (curve) => {
    return !!allIntersections.find((intersection) => {
      return pntEq(intersection, curve.lastPoint);
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
      intersector.Init_1(thisCurve.wrapped, otherCurve.wrapped, 1e-3);

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
    return curve.splitAt(intersections);
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
      secondIntersectedSegments[0][0].lastPoint,
      firstIntersectedSegments[0][0].lastPoint
    )
  ) {
    secondIntersectedSegments.reverse();
    secondIntersectedSegments.forEach((segment) => {
      segment.reverse();
      segment.forEach((curve) => curve.reverse());
    });
  }

  return zip([firstIntersectedSegments, secondIntersectedSegments]);
}

const fuseBlueprints = (first, second) => {
  // TODO: handle overlapping curves
  const segments = blueprintsIntersectionSegments(first, second);
  const s = segments.flatMap(([firstSegment, secondSegment]) => {
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
        secondSegment.forEach((s) => s.reverse());
      }
      segments.push(...secondSegment);
    }

    return segments;
  });

  return new Blueprint(s);
};

export function blueprintsIntersect(first, second) {
  const oc = getOC();
  const intersector = new oc.Geom2dAPI_InterCurveCurve_1();

  for (const thisCurve of first.curves) {
    for (const otherCurve of second.curves) {
      intersector.Init_1(thisCurve.wrapped, otherCurve.wrapped, 1e-6);
      if (intersector.NbPoints()) return true;
    }
  }
  return false;
}

export const curvesInfo = (curves) => {
  return curves.map((c) => c.repr).join("\n") + "\n --- \n";
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
