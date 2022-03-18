//import api from "./worker";

import { wrap } from "comlink";
import CadWorker from "./worker?worker";
const api = wrap(new CadWorker());

export default api;
