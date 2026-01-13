import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  // k6 Cloud configuration (optional - only used when running with 'k6 cloud' command)
  // Note: 'cloud' replaces the deprecated 'ext.loadimpact' option
  cloud: {
    projectID: 1,
    name: "Smoke Test",
  },
  report: {
    directory: "./results/html",
    fileName: "smoke-test-report",
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  summaryTimeUnit: "ms",
  scenarios: {
    smoke_test: {
      executor: "constant-vus",
      vus: 1,
      duration: "1m",
      gracefulStop: "5s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

export default function () {
  postsTest();
}

export function handleSummary(data) {
  return {
    "results/html/smoketest.html": htmlReport(data),
  };
}
