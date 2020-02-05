import {
  pipe,
  curry,
  when,
  prop,
  assoc,
  always,
  path,
  map,
  mergeAll
} from "ramda";

const handleServerResponse = response => {
  return response.json().then(responseJson => ({
    ...responseJson,
    error: !response.ok
      ? new Error(
          `Got HTTP error: "${response.status}: ${response.statusText}, cause: "${responseJson.data.message}".`
        )
      : null
  }));
};

const createMetaRequest = p => ({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Files": p
  },
  method: "POST",
  credentials: "include",
  body: JSON.stringify({
    action: "metadata",
    params: {
      file: p
    }
  })
});

const extractMeasurements = tree => {
  return tree.children.reduce((acc, child) => {
    if (child.children) {
      return [...acc, ...extractMeasurements(child)];
    }
    return [
      ...acc,
      child.type === "measurement" && { ...child, id: child.name }
    ];
  }, []);
};

const handleMetaResponse = curry((forFile, response) =>
  handleServerResponse(response).then(
    pipe(
      when(prop("error"), handled => {
        throw handled.error;
      }),
      handled =>
        pipe(
          always({}),
          assoc("path", forFile),
          assoc("streams", extractMeasurements(handled.data.metadata))
        )(handled)
    )
  )
);

export const getMeta = async (paths, endPoint) => {
  return Promise.all(
    paths.map(p =>
      Promise.resolve(createMetaRequest(p))
        .then(request => fetch(endPoint, request))
        .then(handleMetaResponse(p))
    )
  ).then(metadata => ({ metadata }));
};

const createDataRequest = args => {
  const {
    file,
    measurements,
    start: offset = undefined,
    end = undefined
  } = args;
  return {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Files": file
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      action: "data",
      params: {
        file,
        measurements: measurements.map(prop("name")),
        offset,
        rows: measurements[0].resolution,
        limit: end - offset,
        unit: "MILLI"
      }
    })
  };
};

const handleDataResponse = response =>
  handleServerResponse(response).then(
    pipe(
      when(prop("error"), handled => {
        throw handled.error;
      }),
      path(["data", "measurements"]),
      map(pipe(map(([x, y]) => ({ x, y: y === "NaN" ? null : y }))))
    )
  );

export const getData = (requests, endPoint) => {
  return Promise.all(
    requests.map(requestParams =>
      Promise.resolve(createDataRequest(requestParams))
        .then(params => fetch(endPoint, params))
        .then(handleDataResponse)
    )
  ).then(mergeAll);
};
