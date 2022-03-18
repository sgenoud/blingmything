import * as React from "react";
import { Box3, Vector3, Sphere } from "three";
import { useThree } from "@react-three/fiber";

export default function AutoViewport({ children, center, ...props }) {
  const camera = useThree((state) => state.camera);
  const canvasSize = useThree((state) => state.size);
  const { invalidate } = useThree();
  const outer = React.useRef(null);
  const inner = React.useRef(null);

  const [{ radius, previousRadius, top, boxHeight, boxWidth }, set] =
    React.useState({
      previousRadius: null,
      radius: 0,
      top: 0,
      boxHeight: 0,
      boxWidth: 0,
    });

  React.useLayoutEffect(() => {
    outer.current.updateWorldMatrix(true, true);
    const box3 = new Box3().setFromObject(inner.current);

    if (center) {
      const centerPoint = new Vector3();
      box3.getCenter(centerPoint);
      outer.current.position.set(
        outer.current.position.x - centerPoint.x,
        outer.current.position.y - centerPoint.y,
        outer.current.position.z - (center === "all" ? centerPoint.z : 0)
      );
    }

    const sphere = new Sphere();
    box3.getBoundingSphere(sphere);

    set({
      radius: sphere.radius,
      previousRadius: radius,
      top: box3.max.z,
      boxHeight: box3.max.y - box3.min.y,
      boxWidth: box3.max.x - box3.min.x,
    });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  React.useLayoutEffect(() => {
    if (previousRadius && previousRadius !== radius) {
      const ratio = radius / previousRadius;
      camera.position.set(
        camera.position.x * ratio,
        camera.position.y * ratio,
        camera.position.z * ratio
      );

      camera.far = Math.max(5000, radius * 4);

      invalidate();
      return;
    }

    camera.position.set(
      radius * 0.25,
      -radius * 1.5,
      Math.max(top, radius) * 1.5
    );
    camera.near = 0.1;
    camera.far = Math.max(5000, radius * 4);
    camera.lookAt(0, 0, 0);

    if (camera.type === "OrthographicCamera") {
      camera.zoom =
        Math.min(canvasSize.width / boxWidth, canvasSize.height / boxHeight) *
          0.4 || 5;
      camera.near = -Math.max(5000, radius * 4);
      camera.updateProjectionMatrix();
    }

    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, top, previousRadius]);

  return (
    <group {...props}>
      <group ref={outer}>
        <group ref={inner}>{children}</group>
      </group>
    </group>
  );
}
