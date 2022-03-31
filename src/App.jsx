import React from "react";
import styled from "styled-components";

import Menu from "./Menu.jsx";
import Viewer from "./Viewer.jsx";

import Logo from "./Logo.jsx";

const Main = styled.div`
  display: grid;
  grid-template:
    "nav nav" 30px
    "menu main" calc(100vh - 30px - 4.5rem) / 250px auto;

  height: 100vh;
  width: 100%;
  padding: 2rem;
  padding-top: 1rem;
  grid-gap: 1.5rem;

  & > :first-child {
    grid-area: nav;
    display: flex;
    align-items: flex-end;
    & > :first-child {
      margin-right: 0.5em;
    }
  }

  & > :nth-child(2) {
    overflow-y: auto;
    grid-area: menu;
  }

  & > :nth-child(3) {
    grid-area: main;
  }
`;

export default React.memo(function ReplicadApp() {
  return (
    <>
      <Main>
        <div>
          <Logo size="2em" />
          Pimp my Thing
        </div>
        <Menu />
        <Viewer />
      </Main>
    </>
  );
});
