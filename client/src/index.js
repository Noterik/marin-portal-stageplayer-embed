import url from "url";
import path from "path";
import querystring from "querystring";
import pkg from "../../package.json";
import { fetchData, fetchDataMetadata } from "./data-api";
import constants from "../../constants";

console.log(`Marin Portal StagePlayer Embed 123 ${pkg.version}`);

const { STAGE_ENDPOINT } = constants;

const paramsStr =
  window.location.search.indexOf("?") === 0
    ? window.location.search.substring(1)
    : window.location.search;
const params = querystring.parse(paramsStr);

const { stage = undefined } = params;

const stageURL = url.resolve(window.location.href, STAGE_ENDPOINT);

const defaultArgs = {
  target: "#root",
  fetchStage: async () =>
    fetch(`${stageURL}?${querystring.stringify({ file: stage })}`).then(r =>
      r.json()
    ),
  save: () => {
    return Promise.reject();
  },
  saveAs: () => {
    return Promise.reject();
  },
  saveFragment: () => {
    return Promise.reject();
  },
  exportSettings: () => {
    return Promise.reject();
  },
  toggleDevTools: () => {
    return Promise.reject();
  },
  resolveFileURI: ({ path: filePath }) => {
    const ext = path.extname(filePath).toLowerCase();
    return ext !== ".sbf" && ext !== ".h5m"
      ? `export${path.resolve(path.dirname(stage), filePath)}`
      : filePath;
  },
  fetchData,
  fetchDataMetadata
};

const initStagePlayer = () => {
  const args = { ...defaultArgs };
  if (!stage) {
    args.error = "No stage specified.";
    marin.StagePlayer(args);
    return;
  }
  marin.StagePlayer(args);
};

document.addEventListener("DOMContentLoaded", initStagePlayer);
