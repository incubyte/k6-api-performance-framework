import userJourney from "../src/user-journeys/users-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
  ext: {
    loadimpact: {
      projectID: 1,
      name: "Stress Test",
    },
  },
  report: {
    directory: "./results/html",
    fileName: "stress-test-report",
  },
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  summaryTimeUnit: "ms",
  noColor: true,
  scenarios: {
    stress_test: {
      executor: "ramping-arrival-rate",
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: "2m", target: 10 }, // Ramp up to 10 iterations/s
        { duration: "5m", target: 20 }, // Ramp up to 20 iterations/s
        { duration: "2m", target: 30 }, // Ramp up to 30 iterations/s
        { duration: "5m", target: 30 }, // Stay at 30 iterations/s
        { duration: "2m", target: 0 }, // Ramp down to 0
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1500"],
    http_req_failed: ["rate<0.05"], // Allow up to 5% error rate during stress
    http_reqs: ["rate>150"],
  },
};

export default function () {
  userJourney();
}

export function handleSummary(data) {
  return {
    "results/html/stress-test.html": htmlReport(data),
  };
}
