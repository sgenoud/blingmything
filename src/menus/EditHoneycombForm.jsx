import React, { useState } from "react";
import { observer } from "mobx-react";

import useAppState from "../useAppState";

import { InputBlock, Form, SaveButtonRow } from "./common";

export default observer(function EditHoneycombForm() {
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
    </Form>
  );
});
