require('es6-promise').polyfill();
require('isomorphic-fetch');

const path = require('path');
const querystring = require('querystring');
const { sprintf } = require('sprintf-js');
//const settings = require('./stagesettings.json');

const paramsStr = window.location.search.indexOf('?') === 0 ? window.location.search.substring(1) : window.location.search;
const params = querystring.parse(paramsStr);

const { ASSET_TEMPLATE, DATA_ENDPOINT } = process.env;

const defaultArgs = {
  target: '#root',
  dataEndPoint: DATA_ENDPOINT,
};

function initStagePlayer() {
  if (!params.stage) {
    const args = {
      ...defaultArgs,
      error: 'No stage specified.',
    };

    marin.StagePlayer(args);

    return;
  }

  const url = sprintf(ASSET_TEMPLATE, params.stage);
  const parent = path.dirname(url);

  console.info('Fetching StagePlayer JSON ', url);

  fetch(url, {
    credentials: 'include',
  })
    .then((response) => {
      if (!response.ok) {
        console.log('error!');
        throw Error(`${response.status}:${response.statusText} on ${url}`);
      } else {
        console.log('no error');
        return response.json();
      }
    })
    /*
    .then((stage) => {
      console.log('received stage = ', stage);
      return {
        ...settings,
        ...stage,
        files: {
          ...stage.files,
          entities: {
            ...stage.files.entities,
            files: {
              ...stage.files.entities.files,
              byId: stage.files.entities.files.ids.reduce((acc, id) => {
                const file = stage.files.entities.files.byId[id];

                return {
                  ...acc,
                  [id]: {
                    ...file,
                    path: path.resolve(parent, file.path),
                  },
                };
              }, {}),
            },
          },
        },
      };
    })
    */
    .then((stage) => {
      const args = {
        ...defaultArgs,
        stageRoot: parent,
        stage,
      };

      console.info('Initializing StagePlayer with arguments ', args);
      marin.StagePlayer(args);
    })
    .catch((error) => {
      console.log('error = ', error);
      const args = {
        ...defaultArgs,
        error: error.message,
      };

      marin.StagePlayer(args);
    });
}

document.addEventListener('DOMContentLoaded', initStagePlayer);
