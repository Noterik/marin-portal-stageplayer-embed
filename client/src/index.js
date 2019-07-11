const querystring = require('querystring');
const marin = require('marin');
const constants = require('../../constants');

const {
  STAGE_ENDPOINT,
  DATA_ENDPOINT,
  SBF_DATA_ENDPOINT,
} = constants;

const paramsStr = window.location.search.indexOf('?') === 0
  ? window.location.search.substring(1)
  : window.location.search;
const params = querystring.parse(paramsStr);

const { stage = undefined } = params;

const outgoingActions = {
  getStage: async (url) => fetch(`${STAGE_ENDPOINT}?${querystring.stringify({ file: stage })}`).then(r => r.json()),
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
}
const defaultArgs = {
  target: '#root',
  dataEndpoint: DATA_ENDPOINT,
  sbfDataEndpoint: SBF_DATA_ENDPOINT,
  outgoingActions,
  stage,
};

const initStagePlayer = () => {
  const args = { ...defaultArgs };
  if(!stage) {
    args.error = 'No stage specified.';
    marin.StagePlayer(args);
    return;
  }

  marin.StagePlayer(args);
}

document.addEventListener('DOMContentLoaded', initStagePlayer);