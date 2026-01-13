import http from "k6/http";
import { check } from "k6";
import { logInfo, logError, logSuccess } from "./utils.js";

export function performRequest(method, url, payload, headers, checks, successMsg, label) {
  logInfo(`Requesting ${label} at ${url}`);
  let res;
  if (method === "del") {
    res = http.del(url, null, { headers });
  } else {
    // IMPORTANT: k6 HTTP module behavior with Content-Type header
    //
    // When Content-Type: application/json is pre-set in headers (as in our baseApiHeaders):
    // - k6 expects payload as a STRING, not an object
    // - If you pass an object, k6 sends "[object Object]" literally, causing 500 errors
    //
    // When Content-Type is NOT set:
    // - k6 automatically stringifies JavaScript objects
    // - k6 automatically sets Content-Type: application/json
    //
    // Our approach:
    // 1. Keep payloads as objects in our code (easy to modify/parameterize)
    // 2. Stringify here before passing to k6 (handles pre-set Content-Type)
    // 3. Best of both worlds: clean code + k6 compatibility
    const body = payload != null && typeof payload === "object" ? JSON.stringify(payload) : payload;
    res =
      body != null && method !== "get" ? http[method](url, body, { headers }) : http[method](url, { headers });
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
