import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { sleep } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { createScenarioOptions } from "../src/config/scenario-base.js";

// Load Test: Ramping load with stages
// Use for: Performance baseline, capacity planning
export const options = createScenarioOptions(
    "Load Test",
    {
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
    {
        // Custom thresholds for load test
        http_req_duration: ["p(95)<1000", "p(99)<2000"],
        http_req_failed: ["rate<0.1"], // Allow up to 10% errors due to rate limiting
        http_reqs: ["rate>50"], // Minimum 50 requests/second
    },
    {
        // Additional options
        systemTags: ["status", "method", "url", "name", "error", "check", "group"],
    }
);

export default function () {
    postsTest();
    sleep(randomIntBetween(2, 5)); // Think time between iterations
}

export function handleSummary(data) {
    return {
        "results/html/loadtest.html": htmlReport(data),
    };
}
