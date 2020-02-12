const querystring = require('querystring');
const url = require('url');
const constants = require('../../constants');

const { STAGE_ENDPOINT, DATA_ENDPOINT, SBF_DATA_ENDPOINT } = constants;

const paramsStr = window.location.search.indexOf('?') === 0
  ? window.location.search.substring(1)
  : window.location.search;
const params = querystring.parse(paramsStr);

const { stage = undefined } = params;

const stageURL = url.resolve(window.location.href, STAGE_ENDPOINT);
const dataURL = url.resolve(window.location.href, DATA_ENDPOINT);
const sbfDataURL = url.resolve(window.location.href, SBF_DATA_ENDPOINT);

const outgoingActions = {
  fetchStage: async () => fetch(`${stageURL}?${querystring.stringify({ file: stage })}`).then(r => r.json()),
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
};

const defaultArgs = {
  target: '#root',
  dataEndpoint: dataURL,
  sbfDataEndpoint: sbfDataURL,
  fileURITemplate: 'export%s',
  outgoingActions,
  stage,
};

const initStagePlayer = () => {
  const args = { ...defaultArgs };
  if (!stage) {
    args.error = 'No stage specified.';
    marin.StagePlayer(args);
    return;
  }
  marin.StagePlayer(args);
};

document.addEventListener('DOMContentLoaded', initStagePlayer);
