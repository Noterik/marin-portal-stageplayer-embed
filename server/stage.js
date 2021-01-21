const path = require("path");
const fs = require("fs").promises;
const R = require("ramda");
const {
  createStageHandler,
  createStageSettingsHandler
} = require("insync-stage-handler");
const options = require("./options");
const { getSettings } = require("./settings");
const { LOGGER } = require("./logger");

const handler = createStageHandler();
const settingsHandler = createStageSettingsHandler();

const { assetRoot } = options;

const readStage = file => fs.readFile(file, "utf-8").then(JSON.parse);

const joinWithAssetRoot = p => path.normalize(`${assetRoot}/${p}`);

const fixPath = stagePath => {
  const stageDir = path.parse(stagePath).dir;
  return R.evolve({
    path: R.pipe(
      R.tap(p =>
        LOGGER.debug(`Fixing path "${p}", stage dir = "${stageDir}".`)
      ),
      R.when(R.complement(path.isAbsolute), p => path.resolve(stageDir, p)),
      R.when(R.complement(R.startsWith(assetRoot)), joinWithAssetRoot),
      path.normalize,
      p => path.relative(stageDir, p),
      // TODO: This is a hack until this is resolved: https://github.com/Noterik/marin-stageplayer/issues/127
      p => (p.match(/.+.(sbf|h5m)$/gim) ? path.resolve(stageDir, p) : p),
      R.tap(p => LOGGER.debug(`Fixed path "${p}.`))
    )
  });
};

const getStage = p => {
  const resolvedP = joinWithAssetRoot(p);
  return Promise.all([readStage(resolvedP), getSettings(resolvedP)]).then(
    ([stage, settings]) => {
      // console.log("handled settings = ", settingsHandler(stage, settings));
      const handledSettings = settingsHandler(stage, settings);
      console.log("handledSettings = ", handledSettings);
      return R.pipe(
        R.mergeLeft(settings),
        R.assocPath(["menu", "visible"], false),
        R.assocPath(["annotations", "allowed"], false),
        R.assoc("data", R.prop("data", settings)),
        R.assocPath(
          ["data", "measurementScale"],
          R.path(["data", "measurementScale"], stage)
        ),
        R.assocPath(
          ["timeline", "entities", "comments"],
          R.path(["timeline", "entities", "comments"], stage)
        ),
        handler,
        R.prop("stage"),
        R.over(
          R.lensPath(["files", "entities", "files", "byId"]),
          R.map(fixPath(resolvedP))
        ),
        R.tap(mergedStage => {
          LOGGER.debug("merged stage = ", mergedStage);
        })
      )(stage);
    }
  );
};

module.exports = {
  getStage
};
