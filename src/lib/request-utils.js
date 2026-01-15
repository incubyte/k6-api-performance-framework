import http from "k6/http";
import { logInfo, logSuccess, logError } from "./utils.js";

/**
 * Pure HTTP request wrapper without validation
 * Validation responsibility belongs to the Steps layer
 */
export function performRequest(method, url, payload, headers, checks, successMsg, label) {
  logInfo(`Requesting ${label} at ${url}`);

  let res;
  if (method === "del") {
    res = http.del(url, null, { headers });
  } else {
    // k6 HTTP module behavior: stringify payload if it's an object
    const body = payload != null && typeof payload === "object" ? JSON.stringify(payload) : payload;
    res = body != null && method !== "get" ? http[method](url, body, { headers }) : http[method](url, { headers });
  }

  // Log result (validation happens in Steps layer)
  if (res && res.status >= 200 && res.status < 300) {
    logSuccess(successMsg);
  } else if (res) {
    logError(`${label} returned status ${res.status}`);
  }

  return res;
}

export function performGet(url, headers, checks, successMsg, label) {
  return performRequest("get", url, null, headers, checks, successMsg, label);
}

export function performPost(url, payload, headers, checks, successMsg, label) {
  return performRequest("post", url, payload, headers, checks, successMsg, label);
}

export function performPut(url, payload, headers, checks, successMsg, label) {
  return performRequest("put", url, payload, headers, checks, successMsg, label);
}

export function performDelete(url, headers, checks, successMsg, label) {
  logInfo(`Headers for delete request:`, headers);
  return performRequest("del", url, null, headers, checks, successMsg, label);
}

export function buildHeaders({ base = {}, contentType, ...additionalHeaders } = {}) {
  const headers = { ...base };

  if (contentType) headers["Content-Type"] = contentType;

  return { ...headers, ...additionalHeaders };
}
