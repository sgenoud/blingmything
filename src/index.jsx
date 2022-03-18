import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";

import "./index.css"

import { AppStateContext } from "./useAppState";
import AppState from "./state";

// This is here to compensate for a bug in vite
import "replicad-opencascadejs/src/replicad_single.wasm?url";

const state = AppState.create();

ReactDOM.render(
  <React.StrictMode>
    <AppStateContext.Provider value={state}>
      <App />
    </AppStateContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://vitejs.dev/guide/api-hmr.html
if (import.meta.hot) {
  import.meta.hot.accept();
}
