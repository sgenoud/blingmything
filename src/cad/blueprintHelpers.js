import { fuseBlueprints } from "replicad";

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
      if (!blueprint.intersects(otherBlueprint)) return;

      savedBlueprint.current = fuseBlueprints(blueprint, otherBlueprint);
      if (otherIsFused) {
        fused.get(currentIndex).current = false;
      }
      fused.set(currentIndex, savedBlueprint);
    });
  });

  return output.map(({ current }) => current).filter((a) => a);
};
