import * as R from "ramda";

const { default: PQueue } = require("p-queue");

const queue = new PQueue({ concurrency: 1 });

const handleDataServerResponse = r => {
  if (!r.ok) throw new Error(`Got HTTP error: "${r.status}: ${r.statusText}"`);
  return r.json();
};

export const fetchDataMetadata = R.curry(async (endpoint, file) => {
  const args = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Files": file
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      getMeta: {
        files: [file]
      }
    })
  };

  const r = await fetch(endpoint, args);
  const json = await handleDataServerResponse(r);

  const result = R.pipe(
    R.path(["metadata", 0]),
    ({ streams: measurements, ...metadata }) => ({ measurements, ...metadata }),
    R.over(
      R.lensProp("measurements"),
      R.map(measurement => ({
        file,
        id: measurement.name,
        ...measurement
      }))
    )
  )(json);
  return result;
});

export const fetchData = R.curry(async (endpoint, args) => {
  const sbfArgs = {
    getData: {
      file: args.file,
      start: args.offset,
      end: args.offset + args.limit,
      streams: args.measurements,
      resolution: args.rows
    }
  };

  const body = JSON.stringify([sbfArgs]);

  const fetchArgs = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Files": args.file
    },
    credentials: "include",
    method: "POST",
    body
  };

  return queue.add(() =>
    fetch(endpoint, fetchArgs)
      .then(handleDataServerResponse)
      .then(
        R.pipe(
          R.map(R.prop("streams")),
          R.flatten,
          R.map(R.pipe(R.pick(["name", "data"]), R.values)),
          R.fromPairs,
          R.map(R.map(([x, y]) => ({ x, y })))
        )
      )
  );
});

export default endpoint => ({
  fetchDataMetadata: fetchDataMetadata(endpoint),
  fetchData: fetchData(endpoint)
});
