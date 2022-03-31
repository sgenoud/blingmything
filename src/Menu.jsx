import React, { useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import useAppState from "./useAppState";

import { IconButton, IconGroup } from "./components/buttons.jsx";
import download from "./download";

import UndoIcon from "./icons/Undo";
import RedoIcon from "./icons/Redo";
import DownloadIcon from "./icons/Download";
import LoadingIcon from "./icons/Loading";

import { InputBlock } from "./menus/common";

import EditTextForm from "./menus/EditTextForm.jsx";
import EditSVGForm from "./menus/EditSVGForm.jsx";
import EditInsetForm from "./menus/EditInsetForm.jsx";
import EditHoneycombForm from "./menus/EditHoneycombForm.jsx";
import EditGridForm from "./menus/EditGridForm.jsx";

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  & > :not(:first-child):not(hr) {
    margin-top: 0.6rem;
  }
`;

const EditButtons = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DownloadButton = observer(() => {
  const state = useAppState();
  const [loading, setLoading] = useState(false);

  const dl = async () => {
    setLoading(true);
    try {
      await download(state.currentValues);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <IconButton
      disabled={!state.baseShapeReady || state.processing}
      onClick={dl}
    >
      {loading ? <LoadingIcon size="1.5em" /> : <DownloadIcon size="1.3em" />}
    </IconButton>
  );
});

const DecorationConfig = observer(() => {
  const state = useAppState();
  const [decorationType, setDecorationType] = useState(
    state.activeDecoration?.decoration || "text"
  );

  const canEdit = state.ui.faceSelected || state.ui.faceSelected === 0;

  let body = null;

  const currentDecoration = canEdit
    ? decorationType
    : state.activeDecoration?.decoration;

  if (currentDecoration === "text") body = <EditTextForm />;
  if (currentDecoration === "svg") body = <EditSVGForm />;
  if (currentDecoration === "inset") body = <EditInsetForm />;
  if (currentDecoration === "honeycomb") body = <EditHoneycombForm />;
  if (currentDecoration === "grid") body = <EditGridForm />;

  return (
    <>
      <InputBlock title="Decoration type" htmlFor="type-select">
        <select
          id="type-select"
          value={currentDecoration}
          disabled={!canEdit || state.activeDecoration}
          onChange={(e) => setDecorationType(e.target.value)}
        >
          <option value="text">Text</option>
          <option value="svg">Vector Image (SVG)</option>
          <option value="honeycomb">Honeycomb</option>
          <option value="inset">Inset</option>
          <option value="grid">Grid</option>
        </select>
      </InputBlock>

      {body}
    </>
  );
});

export default observer(() => {
  const state = useAppState();

  return (
    <Menu>
      <EditButtons>
        <IconGroup>
          <IconButton
            disabled={!state.history.canUndo}
            onClick={() => state.history.undo()}
          >
            <UndoIcon />
          </IconButton>
          <IconButton
            disabled={!state.history.canRedo}
            onClick={() => state.history.redo()}
          >
            <RedoIcon />
          </IconButton>
        </IconGroup>
        <DownloadButton />
      </EditButtons>

      <button
        disabled={
          !state.baseShapeLoaded ||
          state.ui.faceSelectionMode ||
          state.processing
        }
        onClick={state.ui.newSelection}
      >
        Add decoration
      </button>

      <DecorationConfig />
    </Menu>
  );
});
