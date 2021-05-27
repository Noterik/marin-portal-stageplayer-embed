const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const request = require("request");

const path = require("path");
const bodyParser = require("body-parser");
const { getStage } = require("./stage");
const { LOGGER } = require("./logger");
const options = require("./options");
const constants = require("../constants.js");

LOGGER.debug("Start with options.", options);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get(`/(/)?${constants.STAGE_ENDPOINT}`, (req, res) => {
  LOGGER.info("Request.", req);
  getStage(req.query.file).then(stage => res.json(stage));
});

app.use(
  "/(/)?lib",
  express.static(
    path.resolve(__dirname, "../node_modules/insync-stageplayer/dist/online")
  )
);
app.use(`(/)?${options.assetRoot}`, express.static(options.assetRoot));

const regexMatch = pattern => pathname => pathname.match(pattern);
app.use(
  createProxyMiddleware(regexMatch("/(/)?lib"), {
    target: options.libServer,
    pathRewrite: {
      "^/(/)?lib": ""
    },
    onProxyRes(proxyRes, req) {
      if (
        req.url &&
        (req.url.endsWith(".html") || req.url.endsWith(".bundle.js"))
      ) {
        /* eslint-disable no-param-reassign */
        proxyRes.headers["Cache-Control"] =
          "no-cache, no-store, must-revalidate";
        proxyRes.headers.Pragma = "no-cache";
        proxyRes.headers.Expires = 0;
        /* eslint-enable no-param-reassign */
      }
    }
  })
);

const dataRegEx = new RegExp(`/(/)?${constants.DATA_ENDPOINT}`);
app.use(
  createProxyMiddleware(regexMatch(dataRegEx), {
    target: options.dataServer,
    pathRewrite(p) {
      const rewrittenPath = p.replace(dataRegEx, "");
      return rewrittenPath;
    },
    ws: true,
    changeOrigin: true
  })
);

app.use(
  createProxyMiddleware(regexMatch(`/(/)?${constants.SBF_DATA_ENDPOINT}`), {
    target: options.sbfDataServer
  })
);

function setCustomCacheControl(res, p) {
  if (p.endsWith(".html")) {
    // Custom Cache-Control for HTML files
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  }
}

if (process.env.NODE_ENV !== "production") {
  LOGGER.debug("Serving through webpack dev server.");
  app.use(
    "/",
    createProxyMiddleware(`http://localhost:${constants.CLIENT_PORT}`)
  );
} else {
  const publicDir = path.resolve(__dirname, "../client/public/");
  LOGGER.debug(`Serving static files from ${publicDir}.`);
  app.use(express.static(publicDir, { setHeaders: setCustomCacheControl }));
}

app.listen(options.port, options.host, () => {
  LOGGER.info(`listening on ${options.host}:${options.port}.`);
});

LOGGER.info("Setting interval to ping measurement server");

setInterval(() => {
  LOGGER.info(`Sending to ${options.dataServer}`);
  request(
    {
      url: options.dataServer,
      timeout: 1000
    },
    err => {
      if (err) {
        return LOGGER.error(err);
      }
      LOGGER.info(`Got response from ${options.dataServer}`);
      return false;
    }
  );
}, 10000);
