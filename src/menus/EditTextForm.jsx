import React, { useState } from "react";
import { observer } from "mobx-react";

import useAppState from "../useAppState";

import { Inline, InputBlock, Form, SaveButtonRow } from "./common";

export default observer(function EditTextForm() {
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
      <SaveButtonRow saveDisabled={!text} />
      <InputBlock title="Text" htmlFor="text">
        <input
          id="text"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </InputBlock>

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
    </Form>
  );
});
