import React, { useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";

import useAppState from "../useAppState";

import logoSvgString from "../logo.svg?raw";

import { Inline, InputBlock, ActiveText, Form, SaveButtonRow } from "./common";

const DropzoneWrapper = styled.div`
  background-color: var(--color-bg-secondary);
  border: 1px dashed var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
  padding: 1em;
  height: 150px;
  ${(props) => (props.isDragActive ? "border-color: var(--color);" : "")}
  ${(props) =>
    props.hasContent
      ? `
    background-color: transparent;
    `
      : ""}

    & > img {
    object-fit: contain;
    fill: black;
    height: 100%;
  }
`;

function SVGDropzone({ onChange, value }) {
  const onDrop = async (files) => {
    const file = files[0];
    if (!file) return;

    onChange(await file.text());
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const imageURL =
    value && URL.createObjectURL(new Blob([value], { type: "image/svg+xml" }));

  return (
    <DropzoneWrapper
      hasContent={!!value}
      isDragActive={isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} accept="image/svg+xml" />
      {value ? (
        <img src={imageURL} />
      ) : (
        <>
          <div>Choose a SVG file</div>
          <div style={{ fontSize: "small" }}>
            or use{" "}
            <ActiveText
              onClick={(e) => {
                e.stopPropagation();
                onChange(logoSvgString);
              }}
            >
              the logo
            </ActiveText>
          </div>
        </>
      )}
    </DropzoneWrapper>
  );
}

export default observer(function EditSVGForm() {
  const state = useAppState();

  const [svgString, setSVGString] = useState(
    state.previousDecoration?.svgString || ""
  );
  const [depth, setDepth] = useState(state.previousDecoration?.depth || -0.2);

  const [width, setWidth] = useState(state.previousDecoration?.setWidth || 60);
  const [angle, setAngle] = useState(state.previousDecoration?.angle || 0);

  const [xShift, setXShift] = useState(state.previousDecoration?.xShift || 0);
  const [yShift, setYShift] = useState(state.previousDecoration?.yShift || 0);

  const saveChanges = (e) => {
    e.preventDefault();
    const changes = {
      svgString,
      depth: parseFloat(depth),
      width: parseInt(width),
      angle: parseInt(angle),
      xShift: parseFloat(xShift),
      yShift: parseFloat(yShift),
    };
    if (state.activeDecoration && state.activeDecoration.decoration === "svg") {
      state.activeDecoration.update(changes);
    } else {
      state.addDecoration("svg", changes);
    }
  };

  return (
    <Form onSubmit={saveChanges}>
      <SaveButtonRow saveDisabled={!svgString} />
      <SVGDropzone onChange={setSVGString} value={svgString} />

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
