import React, { useState } from "react";
import { observer } from "mobx-react";

import useAppState from "../useAppState";

import { InputBlock, Form, SaveButtonRow } from "./common";

export default observer(function EditGridForm() {
  const state = useAppState();

  const [depth, setDepth] = useState(state.previousDecoration?.depth || -0.2);
  const [margin, setMargin] = useState(state.previousDecoration?.margin || 2);
  const [width, setWidth] = useState(state.previousDecoration?.width || 16);
  const [height, setHeight] = useState(state.previousDecoration?.height || 12);
  const [padding, setPadding] = useState(
    state.previousDecoration?.padding || 4
  );

  const saveChanges = (e) => {
    e.preventDefault();
    const changes = {
      depth: parseFloat(depth),
      margin: parseInt(margin),
      width: parseInt(width),
      height: parseInt(height),
      padding: parseFloat(padding),
    };

    if (
      state.activeDecoration &&
      state.activeDecoration.decoration === "grid"
    ) {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration("grid", changes);
    }
  };

  return (
    <Form onSubmit={saveChanges}>
      <SaveButtonRow />
      <InputBlock title="Depth" htmlFor="depth">
        <input
          id="depth"
          type="number"
          step="0.1"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
        />
      </InputBlock>

      <InputBlock title="Width" htmlFor="width">
        <input
          id="width"
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
      </InputBlock>
      <InputBlock title="Height" htmlFor="height">
        <input
          id="height"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
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
    </Form>
  );
});
