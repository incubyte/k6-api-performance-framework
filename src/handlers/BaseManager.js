import { sleep } from "k6";
import * as config from "../../config.js";
import * as utils from "../lib/utils.js";
import * as requestUtils from "../lib/request-utils.js";

export class BaseManager {
  constructor(payloads) {
    this.payloads = payloads;
    this.buildHeaders = requestUtils.buildHeaders;
    this.requestDelay = config.requestDelay || 1;
    this.baseApiHeaders = {
      "x-api-key": "reqres-free-v1",
      "Content-Type": "application/json",
    };
  }

  setBaseApiHeaders(headers) {
    this.baseApiHeaders = { ...this.baseApiHeaders, ...headers };
  }

  performApiGet(endpoint, label, expectedStatus = 200, additionalHeaders = {}) {
    const headers = this.buildHeaders({
      base: { ...this.baseApiHeaders, ...additionalHeaders },
    });

    return requestUtils.performGet(
      endpoint,
      headers,
      { [`${label} status is ${expectedStatus}`]: (r) => r.status === expectedStatus },
      `Successfully retrieved ${label}`,
      label,
    );
  }

  performApiPost(endpoint, payload, label, expectedStatus = 201, additionalHeaders = {}) {
    const headers = this.buildHeaders({
      base: { ...this.baseApiHeaders, ...additionalHeaders },
    });

    utils.logInfo(`Submitting ${label}`);
    sleep(this.requestDelay);

    return requestUtils.performPost(
      endpoint,
      payload,
      headers,
      { [`${label} status is ${expectedStatus}`]: (r) => r.status === expectedStatus },
      `Successfully submitted ${label}`,
      label,
    );
  }

  performApiPut(endpoint, payload, label, expectedStatus = 204, additionalHeaders = {}) {
    const headers = this.buildHeaders({
      base: { ...this.baseApiHeaders, ...additionalHeaders },
    });

    utils.logInfo(`Updating ${label}`);
    sleep(this.requestDelay);

    return requestUtils.performPut(
      endpoint,
      payload,
      headers,
      { [`${label} status is ${expectedStatus}`]: (r) => r.status === expectedStatus },
      `Successfully updated ${label}`,
      label,
    );
  }

  performApiDelete(endpoint, label, expectedStatus = 204, additionalHeaders = {}) {
    const headers = this.buildHeaders({
      base: { ...this.baseApiHeaders, ...additionalHeaders },
      contentType: "application/json",
    });

    utils.logInfo(`Deleting ${label}`);
    sleep(this.requestDelay);

    return requestUtils.performDelete(
      endpoint,
      headers,
      { [`${label} status is ${expectedStatus}`]: (r) => r.status === expectedStatus },
      `Successfully deleted ${label}`,
      label,
    );
  }
}
