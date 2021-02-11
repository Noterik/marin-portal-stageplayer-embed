import { pipe, curry, when, prop, assoc, always, path, map } from "ramda";

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

const extractMeasurements = (file, tree, index = "") => {
  return tree.children.reduce((acc, child) => {
    const newIndex = `${index}/${child.name}`;
    if (child.children) {
      return [...acc, ...extractMeasurements(file, child, newIndex)];
    }
    return [
      ...acc,
      child.type === "measurement" && {
        ...child,
        id: newIndex,
        file,
        index: newIndex
      }
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
          assoc(
            "measurements",
            extractMeasurements(forFile, handled.data.metadata)
          )
        )(handled)
    )
  )
);

const createDataRequest = ({ file, measurements, offset, limit, rows }) => {
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
        measurements,
        offset,
        rows,
        limit,
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

export default endpoint => ({
  fetchData: async args => {
    const response = await fetch(endpoint, createDataRequest(args));
    return handleDataResponse(response);
  },
  fetchDataMetadata: async file => {
    const response = await fetch(endpoint, createMetaRequest(file));
    const handled = await handleMetaResponse(file, response);
    return handled;
  }
});
