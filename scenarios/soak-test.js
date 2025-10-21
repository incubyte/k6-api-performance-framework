import userJourney from "../src/user-journeys/users-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  ext: {
    loadimpact: {
      projectID: 1,
      name: "Soak Test",
    },
  },
  report: {
    directory: "./results/html",
    fileName: "soak-test-report",
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  summaryTimeUnit: "ms",
  noColor: true,
  scenarios: {
    soak_test: {
      executor: "constant-vus",
      vus: 10,
      duration: "2h",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<400", "p(99)<800"],
    http_req_failed: ["rate<0.01"], // Only allow 1% error rate for soak test
    http_reqs: ["rate>50"],
  },
};

export default function () {
  userJourney();
}

export function handleSummary(data) {
  return {
    "results/html/soaktest.html": htmlReport(data),
  };
}
