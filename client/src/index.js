import url from "url";
import * as R from "ramda";
import path from "path";
import { OnlineMeasurementDataClient } from "@insync-stageplayer/measurements/lib/client/OnlineMeasurementDataClient";
import querystring from "querystring";
import pkg from "../../package.json";
import constants from "../../constants";

console.log(`Marin Portal StagePlayer Embed ${pkg.version}`);

const { STAGE_ENDPOINT, DATA_ENDPOINT, SBF_DATA_ENDPOINT } = constants;

const paramsStr =
  window.location.search.indexOf("?") === 0
    ? window.location.search.substring(1)
    : window.location.search;
const params = querystring.parse(paramsStr);

const { stage = undefined } = params;

const stageURL = url.resolve(window.location.href, STAGE_ENDPOINT);

let hdfEndpoint;
if (window.location.protocol === "https:") {
  hdfEndpoint = "wss:";
} else {
  hdfEndpoint = "ws:";
}
hdfEndpoint += `//${window.location.host}`;
hdfEndpoint += `${window.location.pathname}${DATA_ENDPOINT}/ws`;
console.log("hdfEndpoint =", hdfEndpoint);

const measurementDataClient = new OnlineMeasurementDataClient({
  hdfEndpoint,
  sbfEndpoint: SBF_DATA_ENDPOINT
});

const defaultArgs = {
  target: "#root",
  fetchStage: async () => {
    const response = await fetch(
      `${stageURL}?${querystring.stringify({ file: stage })}`
    );
    const json = await response.json();
    console.log("JSON = ", json);
    const completeStage = R.pipe(
      R.over(
        R.lensPath(["timeline", "entities", "timeline", "byId"]),
        R.map(R.assocPath(["actions", "copyLink"], false))
      ),
      R.assocPath(["menu", "allowedActions"], [])
    )(json);

    console.log("completeStage = ", completeStage);
    return completeStage;
  },
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
  measurementDataClient
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
