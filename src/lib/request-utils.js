import http from "k6/http";
import { check } from "k6";
import { logInfo, logError, logSuccess } from "./utils.js";

export function performRequest(method, url, payload, headers, checks, successMsg, label) {
  logInfo(`Requesting ${label} at ${url}`);
  let res;
  if (method === "del") {
    res = http.del(url, null, { headers });
  } else {
    res =
      payload != null && method !== "get" ? http[method](url, payload, { headers }) : http[method](url, { headers });
  }
  const passed = check(res, checks);
  if (!passed) {
    logError(`Failed ${label}: ${res.status}`);
    return null;
  }
  logSuccess(successMsg);
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
