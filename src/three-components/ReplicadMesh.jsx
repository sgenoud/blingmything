import React, { useRef, useLayoutEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { BufferGeometry } from "three";
import {
  syncFaces,
  syncLines,
  syncLinesFromFaces,
  getFaceIndex,
  highlightInGeometry,
} from "replicad-threejs-helper";

const MatcapMaterial = React.memo(function MatcapMaterial(props) {
  const [matcap] = useTexture(["/textures/matcap-1.png"]);
  return <meshMatcapMaterial matcap={matcap} {...props} />;
});

export const useApplyHighlights = (geometry, highlight) => {
  const { invalidate } = useThree();

  useLayoutEffect(() => {
    let toHighlight = highlight;

    if (!highlight && highlight !== 0) toHighlight = [];
    else if (!Array.isArray(highlight)) toHighlight = [highlight];

    highlightInGeometry(toHighlight, geometry);
    invalidate();
  }, [geometry, highlight, invalidate]);
};

export const useFaceEvent = (onEvent) => {
  const func = useRef(onEvent);
  useLayoutEffect(() => {
    func.current = onEvent;
  }, [onEvent]);

  return useCallback((e) => {
    if (!func.current) return null;
    const faceIndex = getFaceIndex(e.faceIndex, e.object.geometry);
    func.current(e, faceIndex);
  }, []);
};

export default React.memo(function ShapeMeshes({
  faces,
  edges,
  onFaceClick,
  selected,
  faceHover,
}) {
  const { invalidate } = useThree();

  const body = useRef(new BufferGeometry());
  const lines = useRef(new BufferGeometry());

  const onClick = useFaceEvent(onFaceClick);
  const onHover = (e) => {
    if (!faceHover) return;
    let toHighlight;
    if (e === null) toHighlight = [];
    else {
      const faceIndex = getFaceIndex(e.faceIndex, e.object.geometry);
      toHighlight = [faceIndex];
    }

    highlightInGeometry(toHighlight, body.current);
    invalidate();
  };

  useLayoutEffect(() => {
    if (!faceHover && body.current) highlightInGeometry([], body.current);
  }, [faceHover]);

  useLayoutEffect(() => {
    highlightInGeometry(
      selected || selected === 0 ? [selected] : [],
      body.current
    );
    invalidate();
  }, [selected, invalidate]);

  useLayoutEffect(() => {
    if (faces) syncFaces(body.current, faces);

    if (edges) syncLines(lines.current, edges);
    else if (faces) syncLinesFromFaces(lines.current, body.current);

    invalidate();
  }, [faces, edges, invalidate]);

  useLayoutEffect(
    () => () => {
      body.current.dispose();
      lines.current.dispose();
      invalidate();
    },
    [invalidate]
  );

  return (
    <group>
      <mesh
        geometry={body.current}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerMove={onHover}
        onPointerLeave={() => onHover(null)}
      >
        <MatcapMaterial
          color="#d8e9d8"
          attachArray="material"
          polygonOffset
          polygonOffsetFactor={2.0}
          polygonOffsetUnits={1.0}
        />
        <MatcapMaterial
          color="#add2ad"
          attachArray="material"
          polygonOffset
          polygonOffsetFactor={2.0}
          polygonOffsetUnits={1.0}
        />
      </mesh>
      <lineSegments geometry={lines.current}>
        <lineBasicMaterial color="#244224" />
      </lineSegments>
    </group>
  );
});
