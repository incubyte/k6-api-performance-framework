import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { sleep } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { createScenarioOptions, executorPresets } from "../src/config/scenario-base.js";

// Smoke Test: Minimal load for basic validation
// Use for: Basic functionality verification, pre-production checks
export const options = createScenarioOptions("Smoke Test", {
  smoke_test: executorPresets.smoke,
});

export default function () {
  postsTest();
  sleep(randomIntBetween(1, 3)); // Think time between iterations
}

export function handleSummary(data) {
  return {
    "results/html/smoketest.html": htmlReport(data),
  };
}
