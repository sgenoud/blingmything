import React from "react";
import styled from "styled-components";

import Menu from "./Menu.jsx";
import Viewer from "./Viewer.jsx";

const Main = styled.div`
  display: grid;
  grid-template:
    "nav nav" 30px
    "menu main" auto / 200px auto;

  min-height: 100vh;
  padding: 2rem;
  grid-gap: 1rem;

  & > :first-child {
    grid-area: nav;
  }

  & > :nth-child(2) {
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
        <div>Pimp my Thing</div>
        <Menu />
        <Viewer />
      </Main>
    </>
  );
});
