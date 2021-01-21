import h5mApi from "./h5m";
import sbfApi from "./sbf";

import constants from "../../../constants";

const isSbf = p => p.endsWith(".sbf") || p.endsWith(".SBF");

const getApi = file =>
  isSbf(file)
    ? sbfApi(constants.SBF_DATA_ENDPOINT)
    : h5mApi(constants.DATA_ENDPOINT);

export const fetchDataMetadata = path => getApi(path).fetchDataMetadata(path);

export const fetchData = props => {
  const { file } = props;
  return getApi(file).fetchData(props);
};
