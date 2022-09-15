import React, { useState } from "react";
import { observer } from "mobx-react";

import useAppState from "../useAppState";

import { InputBlock, Form, SaveButtonRow } from "./common";

export default observer(function EditVoronoiForm() {
  const state = useAppState();

  const [depth, setDepth] = useState(state.previousDecoration?.depth || -0.2);
  const [margin, setMargin] = useState(state.previousDecoration?.margin || 2);
  const [cellCount, setCellCount] = useState(
    state.previousDecoration?.cellCount || 10
  );
  const [padding, setPadding] = useState(
    state.previousDecoration?.padding || 4
  );
  const [seed, setSeed] = useState(state.previousDecoration?.seed || 1234);

  const saveChanges = (e) => {
    e.preventDefault();
    const changes = {
      depth: parseFloat(depth),
      margin: parseInt(margin),
      cellCount: parseInt(cellCount),
      padding: parseFloat(padding),
      seed: parseInt(seed),
    };

    if (
      state.activeDecoration &&
      state.activeDecoration.decoration === "voronoi"
    ) {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration("voronoi", changes);
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

      <InputBlock title="Cell Count" htmlFor="cellCount">
        <input
          id="cellCount"
          type="number"
          value={cellCount}
          onChange={(e) => setCellCount(e.target.value)}
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

      <InputBlock title="Seed" htmlFor="seed">
        <input
          id="seed"
          type="number"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
        />
      </InputBlock>
    </Form>
  );
});
