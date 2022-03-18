import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";

import ThreeContext from "./three-components/ThreeContext.jsx";
import ReplicadMesh from "./three-components/ReplicadMesh.jsx";
import ErrorComponent from "./three-components/ErrorComponent.jsx";
import { Banner, PulsingBanner } from "./components/Banners.jsx";
import Dropzone from "./components/Dropzone";

import useAppState from "./useAppState";

const MainSection = styled.div`
  position: relative;
  min-height: 300px;
  height: 100%;
`;

export default observer(function Viewer() {
  const state = useAppState();

  return (
    <MainSection className="main">
      <ThreeContext>
        {!state.error && state.currentMesh && (
          <ReplicadMesh
            edges={state.currentMesh?.edges}
            faces={state.currentMesh?.faces}
            onFaceClick={(e, faceIndex) => {
              if (!state.ui.faceSelectionMode) return;
              state.ui.selectFace(faceIndex);
            }}
            faceHover={state.ui.faceSelectionMode}
            selected={state.ui.faceSelectionMode ? null : state.ui.faceSelected}
          />
        )}
        {state.error && <ErrorComponent />}
      </ThreeContext>
      {!state.baseShapeLoaded && (
        <Dropzone onDrop={(accepted) => state.loadFile(accepted[0])} />
      )}

      {state.error && <Banner>Sorry we could not decorate that!</Banner>}
      {state.processing ? <PulsingBanner>Processing...</PulsingBanner> : null}
      {state.baseShapeLoaded &&
      state.ui.faceSelectionMode &&
      !state.error &&
      !state.processing ? (
        <Banner>Select a face</Banner>
      ) : null}
    </MainSection>
  );
});
