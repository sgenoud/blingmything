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
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const InputBlock = ({ title, htmlFor, children }) => {
  return (
    <InputWrapper>
      <InputTitle htmlFor={htmlFor}>{title}</InputTitle>
      {children}
    </InputWrapper>
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

const SaveButtonRow = observer(() => {
  const state = useAppState();

  return (
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
  );
});

const EditInsetForm = observer(() => {
  const state = useAppState();

  const [depth, setDepth] = useState(state.previousDecoration?.depth || -0.2);

  const [margin, setMargin] = useState(state.previousDecoration?.margin || 2);
  const saveChanges = (e) => {
    e.preventDefault();
    const changes = {
      depth: parseFloat(depth),
      margin: parseInt(margin),
    };

    if (
      state.activeDecoration &&
      state.activeDecoration.decoration === "inset"
    ) {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration("inset", changes);
    }
  };

  return (
    <Form onSubmit={saveChanges}>
      <InputBlock title="Depth" htmlFor="depth">
        <input
          id="depth"
          type="number"
          step="0.1"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Margin" htmlFor="margin">
        <input
          id="margin"
          type="number"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
        />
      </InputBlock>

      <SaveButtonRow />
    </Form>
  );
});

const EditHoneycombForm = observer(() => {
  const state = useAppState();

  const [depth, setDepth] = useState(state.previousDecoration?.depth || -0.2);
  const [margin, setMargin] = useState(state.previousDecoration?.margin || 2);
  const [radius, setRadius] = useState(state.previousDecoration?.radius || 10);
  const [padding, setPadding] = useState(
    state.previousDecoration?.padding || 5
  );

  const saveChanges = (e) => {
    e.preventDefault();
    const changes = {
      depth: parseFloat(depth),
      margin: parseInt(margin),
      radius: parseInt(radius),
      padding: parseFloat(padding),
    };

    if (
      state.activeDecoration &&
      state.activeDecoration.decoration === "honeycomb"
    ) {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration("honeycomb", changes);
    }
  };

  return (
    <Form onSubmit={saveChanges}>
      <InputBlock title="Depth" htmlFor="depth">
        <input
          id="depth"
          type="number"
          step="0.1"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Radius" htmlFor="radius">
        <input
          id="radius"
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Padding" htmlFor="padding">
        <input
          id="padding"
          type="number"
          value={padding}
          onChange={(e) => setPadding(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Margin" htmlFor="margin">
        <input
          id="margin"
          type="number"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
        />
      </InputBlock>

      <SaveButtonRow />
    </Form>
  );
});

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
      depth: parseFloat(depth),
      fontSize: parseInt(fontSize),
      angle: parseInt(angle),
      xShift: parseFloat(xShift),
      yShift: parseFloat(yShift),
    };
    if (
      state.activeDecoration &&
      state.activeDecoration.decoration === "text"
    ) {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration("text", changes);
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
          onChange={(e) => setDepth(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Font Size" htmlFor="fontSize">
        <input
          id="fontSize"
          type="number"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Angle" htmlFor="angle">
        <input
          id="angle"
          type="number"
          min="-360"
          max="360"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Position Shift" htmlFor="xShift">
        <Inline>
          <label htmlFor="xShift">x</label>
          <input
            id="xShift"
            type="number"
            value={xShift}
            onChange={(e) => setXShift(e.target.value)}
          />

          <label htmlFor="yShift">y</label>
          <input
            id="yShift"
            type="number"
            value={yShift}
            onChange={(e) => setYShift(e.target.value)}
          />
        </Inline>
      </InputBlock>
      <SaveButtonRow />
    </Form>
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
  if (currentDecoration === "inset") body = <EditInsetForm />;
  if (currentDecoration === "honeycomb") body = <EditHoneycombForm />;

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
          <option value="honeycomb">Honeycomb</option>
          <option value="inset">Inset</option>
        </select>
      </InputBlock>

      {body && <hr />}
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
