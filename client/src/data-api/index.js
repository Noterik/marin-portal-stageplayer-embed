import * as h5mApi from "./h5m";
import * as sbfApi from "./sbf";

import constants from "../../../constants";

const isSbf = p => p.endsWith(".sbf") || p.endsWith(".SBF");

export const getMeta = path => {
  const hasSbf = isSbf(path);
  return hasSbf
    ? sbfApi.getMeta([path], constants.SBF_DATA_ENDPOINT)
    : h5mApi.getMeta([path], constants.DATA_ENDPOINT);
};

export const getData = args => {
  const hasSbf = args.find(a => isSbf(a.file));
  return hasSbf
    ? sbfApi.getData(args, constants.SBF_DATA_ENDPOINT)
    : h5mApi.getData(args, constants.DATA_ENDPOINT);
};
