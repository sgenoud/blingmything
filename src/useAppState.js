import { createContext, useContext } from "react";

export const AppStateContext = createContext(null);

export default function useAppStateContext() {
  return useContext(AppStateContext);
}
