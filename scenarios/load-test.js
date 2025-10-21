import userJourney from "../src/user-journeys/users-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  ext: {
    loadimpact: {
      projectID: 1,
      name: "Load Test",
    },
  },
  report: {
    directory: "./results/html",
    fileName: "load-test-report",
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  summaryTimeUnit: "ms",
  noColor: true,
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
    http_reqs: ["rate>10"], // Lower the request rate expectation
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  systemTags: ["status", "method", "url", "name", "error", "check", "group"],
  ext: {
    loadimpact: {
      projectID: 1,
      name: "Load Test",
    },
  },
};

export default function () {
  userJourney();
}
export function handleSummary(data) {
  return {
    "results/html/loadtest.html": htmlReport(data),
  };
}
