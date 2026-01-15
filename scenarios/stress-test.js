import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { createScenarioOptions } from "../src/config/scenario-base.js";

// Stress Test: Ramping arrival rate to find breaking point
// Use for: Capacity limits, scalability testing
export const options = createScenarioOptions(
    "Stress Test",
    {
        stress_test: {
            executor: "ramping-arrival-rate",
            startRate: 0,
            timeUnit: "1s",
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
    {
        // Custom thresholds for stress test
        http_req_duration: ["p(95)<500", "p(99)<1500"],
        http_req_failed: ["rate<0.05"], // Allow up to 5% error rate during stress
        http_reqs: ["rate>150"],
    }
);

export default function () {
    postsTest();
}

export function handleSummary(data) {
    return {
        "results/html/stresstest.html": htmlReport(data),
    };
}
