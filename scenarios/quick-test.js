import postsTest from "../src/user-journeys/posts-test.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { createScenarioOptions, executorPresets } from "../src/config/scenario-base.js";

// Quick Test: Single iteration for fast validation
// Use for: Smoke testing, quick checks, CI/CD pipelines
export const options = createScenarioOptions("Quick Test", {
    quick_test: executorPresets.quick,
});

export default function () {
    postsTest();
}

export function handleSummary(data) {
    return {
        "results/html/quick-test.html": htmlReport(data),
    };
}
