import JSZip from "jszip";

import FileSaver from "file-saver";
import api from "./api";

export default async (model) => {
  const waitToBeDone = [];
  const zip = new JSZip();

  zip.file("model.stl", await api.createSTL(model));
  zip.file("model.step", await api.createSTEP(model));

  return Promise.all(waitToBeDone)
    .then(() => zip.generateAsync({ type: "blob" }))
    .then((blob) => FileSaver.saveAs(blob, `pimped-model.zip`));
};
