import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";

import AutoViewport from "./AutoViewport";

// We change the default orientation - threejs tends to use Y are the height,
// while replicad uses Z. This is mostly a representation default.
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const baseStyle = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
  backgroundColor: "#f5f5f5",
};

export default React.memo(function ThreeContext({ children, ...props }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  return (
    <Suspense fallback={<div style={baseStyle} />}>
      <Canvas
        style={baseStyle}
        dpr={dpr}
        frameloop="demand"
        orthographic
        {...props}
      >
        <OrbitControls />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport font="18px HKGrotesk, sans-serif" />
        </GizmoHelper>

        <AutoViewport center>{children}</AutoViewport>
      </Canvas>
    </Suspense>
  );
});
