import { pipe, map, flatten, prop, pick, fromPairs, values } from "ramda";

const { default: PQueue } = require("p-queue");

const queue = new PQueue({ concurrency: 1 });

const handleDataServerResponse = r => {
  if (!r.ok) throw new Error(`Got HTTP error: "${r.status}: ${r.statusText}"`);
  return r.json();
};

export const getMeta = async (paths, endPoint) => {
  const args = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Files": paths.join(",")
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      getMeta: {
        files: paths
      }
    })
  };

  const r = await fetch(endPoint, args);
  return handleDataServerResponse(r);
};

export const getData = (args, endPoint) => {
  // TODO: Remove hack by Pieter
  const realArgs = args.map(
    ({ measurements = undefined, start, end, ...arg }) => ({
      ...arg,
      start,
      end,
      streams: measurements.map(s => ({
        ...s,
        stream: s.name
      }))
    })
  );

  const files = args.map(arg => arg.sbf).join(",");
  const body = JSON.stringify(realArgs.map(arg => ({ getData: arg })));

  const fetchArgs = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Files": files
    },
    credentials: "include",
    method: "POST",
    body
  };

  return queue.add(() =>
    fetch(endPoint, fetchArgs)
      .then(handleDataServerResponse)
      .then(
        pipe(
          map(prop("streams")),
          flatten,
          map(pipe(pick(["name", "data"]), values)),
          fromPairs,
          map(map(([x, y]) => ({ x, y })))
        )
      )
  );
};
