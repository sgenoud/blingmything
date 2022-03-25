import React from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import useAppState from "../useAppState";

const DropboxWrapper = styled.div`
  background-color: var(--color-bg-secondary);
  border: 3px dashed var(--color-text-secondary);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
  ${(props) => (props.isDragActive ? "border-color: var(--color);" : "")}
`;

const ActiveText = styled.span`
  font-weight: bold;
  color: var(--color);
  cursor: pointer;
`;

export default function MyDropzone({ onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const state = useAppState();

  return (
    <DropboxWrapper isDragActive={isDragActive} {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <>
          <p>This tools allows you to modify your 3D models.</p>
          <p>
            It is advised to import STEP files, but ascii STL can also work (but
            they may take a long time to load).
          </p>

          <p>Drag and drop some files here, or click to select files</p>

          <p>
            Alternatively, you can also test the tool{" "}
            <ActiveText
              onClick={(e) => {
                e.stopPropagation();
                state.startWithBox();
              }}
            >
              with a simple box
            </ActiveText>
          </p>
        </>
      )}
    </DropboxWrapper>
  );
}
