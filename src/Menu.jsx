import React, { useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import useAppState from "./useAppState";

import {
  IconButton,
  IconGroup,
  SecondaryActionButton,
} from "./components/buttons.jsx";
import download from "./download";

import UndoIcon from "./icons/Undo";
import RedoIcon from "./icons/Redo";
import DownloadIcon from "./icons/Download";
import LoadingIcon from "./icons/Loading";

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  & > :not(:first-child):not(hr) {
    margin-top: 0.6rem;
  }
`;

const InputTitle = styled.label`
  font-variant: small-caps;
  font-size: 0.8em;
  font-weight: normal;
`;
const InputBlock = ({ title, htmlFor, children }) => {
  return (
    <div>
      <InputTitle htmlFor={htmlFor}>{title}</InputTitle>
      {children}
    </div>
  );
};

const Inline = styled.div`
  display: flex;
  align-items: center;

  & > input {
    flex: 1 1 auto;
  }

  & > label + input {
    margin-left: 0.3em;
  }

  & > input + label {
    margin-left: 1em;
  }
`;

const EditButtons = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SaveButtons = styled.div`
  display: flex;
  justify-content: flex-end;

  margin-top: 0.4em;

  & > {
    :not(:first-child) {
      margin-left: 1em;
    }
  }
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  & > :not(:last-child):not(hr) {
    margin-bottom: 0.6rem;
  }
`;

const EditTextForm = observer(() => {
  const state = useAppState();

  const [text, setText] = useState(
    state.previousDecoration?.text || "pimp me!"
  );
  const [depth, setDepth] = useState(state.previousDecoration?.depth || -0.2);

  const [fontSize, setFontSize] = useState(
    state.previousDecoration?.fontSize || 16
  );
  const [angle, setAngle] = useState(state.previousDecoration?.angle || 0);

  const [xShift, setXShift] = useState(state.previousDecoration?.xShift || 0);
  const [yShift, setYShift] = useState(state.previousDecoration?.yShift || 0);

  const saveChanges = (e) => {
    e.preventDefault();
    const changes = {
      text,
      depth,
      fontSize,
      angle,
      xShift,
      yShift,
    };
    if (state.activeDecoration) {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration(changes);
    }
  };

  return (
    <Form onSubmit={saveChanges}>
      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} />

      <InputBlock title="Depth" htmlFor="depth">
        <input
          id="depth"
          type="number"
          step="0.1"
          value={depth}
          onChange={(e) => setDepth(parseFloat(e.target.value))}
        />
      </InputBlock>

      <InputBlock title="Font Size" htmlFor="fontSize">
        <input
          id="fontSize"
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
        />
      </InputBlock>

      <InputBlock title="Angle" htmlFor="angle">
        <input
          id="angle"
          type="number"
          min="-360"
          max="360"
          value={angle}
          onChange={(e) => setAngle(parseInt(e.target.value))}
        />
      </InputBlock>

      <InputBlock title="Position Shift" htmlFor="xShift">
        <Inline>
          <label htmlFor="xShift">x</label>
          <input
            id="xShift"
            type="number"
            value={xShift}
            onChange={(e) => setXShift(parseInt(e.target.value))}
          />

          <label htmlFor="yShift">y</label>
          <input
            id="yShift"
            type="number"
            value={yShift}
            onChange={(e) => setYShift(parseInt(e.target.value))}
          />
        </Inline>
      </InputBlock>
      <SaveButtons>
        {!state.activeDecoration && (
          <SecondaryActionButton
            disabled={state.processing}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              state.ui.newSelection();
            }}
          >
            Cancel
          </SecondaryActionButton>
        )}
        <button role="submit" disabled={state.processing}>
          {state.activeDecoration ? "Update" : "Apply"}
        </button>
      </SaveButtons>
    </Form>
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
        New face
      </button>

      <hr />
      {(state.activeDecoration ||
        state.ui.faceSelected ||
        state.ui.faceSelected === 0) && <EditTextForm />}
    </Menu>
  );
});
