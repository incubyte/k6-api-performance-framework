import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { sleep } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { createScenarioOptions } from "../src/config/scenario-base.js";

// Soak Test: Extended duration at moderate load
// Use for: Memory leaks, resource exhaustion, stability
export const options = createScenarioOptions(
    "Soak Test",
    {
        soak_test: {
            executor: "constant-vus",
            vus: 10,
            duration: "2h",
        },
    },
    {
        // Custom thresholds for soak test
        http_req_duration: ["p(95)<400", "p(99)<800"],
        http_req_failed: ["rate<0.01"], // Only allow 1% error rate for soak test
        http_reqs: ["rate>50"],
    }
);

export default function () {
    postsTest();
    sleep(randomIntBetween(3, 7)); // Think time between iterations
}

export function handleSummary(data) {
    return {
        "results/html/soaktest.html": htmlReport(data),
    };
}
