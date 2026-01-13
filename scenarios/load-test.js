import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { sleep } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

export const options = {
  // k6 Cloud configuration (optional - only used when running with 'k6 cloud' command)
  // Note: 'cloud' replaces the deprecated 'ext.loadimpact' option
  cloud: {
    projectID: 1,
    name: "Load Test",
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  summaryTimeUnit: "ms",
  scenarios: {
    load_test: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 5 }, // Ramp up to 5 users over 1 minute
        { duration: "2m", target: 5 }, // Stay at 5 users for 2 minutes
        { duration: "1m", target: 10 }, // Ramp up to 10 users over 1 minute
        { duration: "2m", target: 10 }, // Stay at 10 users for 2 minutes
        { duration: "1m", target: 0 }, // Ramp down to 0 users over 1 minute
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.1"], // Allow up to 10% errors due to rate limiting
    http_reqs: ["rate>50"], // Minimum 50 requests/second
  },
  systemTags: ["status", "method", "url", "name", "error", "check", "group"],
};

export default function () {
  postsTest();
  sleep(randomIntBetween(2, 5)); // Think time between iterations
}
export function handleSummary(data) {
  return {
    "results/html/loadtest.html": htmlReport(data),
  };
}
