import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    // k6 Cloud configuration (optional - only used when running with 'k6 cloud' command)
    // Note: 'cloud' replaces the deprecated 'ext.loadimpact' option
    cloud: {
        projectID: 1,
        name: "Quick Test",
    },
    summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
    summaryTimeUnit: "ms",
    scenarios: {
        quick_test: {
            executor: "shared-iterations",
            vus: 1,
            iterations: 1,
            maxDuration: "30s",
        },
    },
    thresholds: {
        http_req_duration: ["p(95)<1000"], // 95% of requests should be below 1000ms
        http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
    },
};

export default function () {
    postsTest();
}

export function handleSummary(data) {
    return {
        "results/html/quick-test.html": htmlReport(data),
    };
}
