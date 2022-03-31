import React, { useState } from "react";
import { observer } from "mobx-react";

import useAppState from "../useAppState";

import { InputBlock, Form, SaveButtonRow } from "./common";

export default observer(function EditInsetForm() {
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
