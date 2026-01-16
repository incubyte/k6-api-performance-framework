/**
 * Scenario Base Configuration
 *
 * Provides shared configuration for all k6 test scenarios.
 * This eliminates duplication across scenario files and ensures consistency.
 *
 * Benefits:
 * - Single source of truth for common config
 * - Easy to update thresholds across all tests
 * - Consistent summary statistics
 * - Reduced code duplication (from 74% to ~0%)
 *
 * Usage:
 * import { createScenarioOptions } from "../src/config/scenario-base.js";
 *
 * export const options = createScenarioOptions("My Test", {
 *   my_scenario: {
 *     executor: "constant-vus",
 *     vus: 5,
 *     duration: "5m"
 *   }
 * });
 */

/**
 * Create k6 scenario options with shared configuration
 *
 * @param {string} testName - Name of the test (shown in k6 Cloud)
 * @param {object} scenarioConfig - k6 scenario configuration (executors, VUs, duration, etc.)
 * @param {object} customThresholds - Optional custom thresholds to merge with defaults
 * @param {object} additionalOptions - Optional additional k6 options
 * @returns {object} Complete k6 options object
 */
export function createScenarioOptions(testName, scenarioConfig, customThresholds = {}, additionalOptions = {}) {
  return {
    // k6 Cloud configuration (optional - only used when running with 'k6 cloud' command)
    cloud: {
      projectID: 1,
      name: testName,
    },

    // Summary statistics to display
    summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
    summaryTimeUnit: "ms",

    // Scenario configuration (executors, VUs, duration, etc.)
    scenarios: scenarioConfig,

    // Performance thresholds (can be overridden with customThresholds)
    thresholds: {
      // Default HTTP request duration threshold
      http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms

      // Default HTTP request failure threshold
      http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail

      // Merge custom thresholds
      ...customThresholds,
    },

    // Additional options (can override any of the above)
    ...additionalOptions,
  };
}

/**
 * Predefined executor configurations for common test types
 * Use these as starting points and customize as needed
 */
export const executorPresets = {
  /**
   * Quick Test: Single iteration for fast validation
   * Use for: Smoke testing, quick checks, CI/CD pipelines
   */
  quick: {
    executor: "per-vu-iterations",
    vus: 1,
    iterations: 1,
    maxDuration: "30s",
  },

  /**
   * Smoke Test: Minimal load for basic validation
   * Use for: Basic functionality verification, pre-production checks
   */
  smoke: {
    executor: "constant-vus",
    vus: 1,
    duration: "1m",
    gracefulStop: "5s",
  },

  /**
   * Load Test: Sustained average load
   * Use for: Performance baseline, capacity planning
   */
  load: (vus = 5, duration = "5m") => ({
    executor: "constant-vus",
    vus,
    duration,
    gracefulStop: "10s",
  }),

  /**
   * Stress Test: Gradual load increase to find breaking point
   * Use for: Capacity limits, scalability testing
   */
  stress: (targetVUs = 20, _duration = "10m") => ({
    executor: "ramping-vus",
    startVUs: 1,
    stages: [
      { duration: "2m", target: targetVUs / 4 }, // Ramp up to 25%
      { duration: "3m", target: targetVUs / 2 }, // Ramp up to 50%
      { duration: "2m", target: targetVUs }, // Ramp up to 100%
      { duration: "2m", target: targetVUs }, // Stay at 100%
      { duration: "1m", target: 0 }, // Ramp down
    ],
    gracefulRampDown: "30s",
  }),

  /**
   * Soak Test: Extended duration at moderate load
   * Use for: Memory leaks, resource exhaustion, stability
   */
  soak: (vus = 3, duration = "15m") => ({
    executor: "constant-vus",
    vus,
    duration,
    gracefulStop: "30s",
  }),

  /**
   * Spike Test: Sudden traffic surge
   * Use for: Auto-scaling validation, traffic spike handling
   */
  spike: (normalVUs = 5, spikeVUs = 50) => ({
    executor: "ramping-vus",
    startVUs: 0,
    stages: [
      { duration: "1m", target: normalVUs }, // Normal load
      { duration: "30s", target: spikeVUs }, // Sudden spike
      { duration: "2m", target: spikeVUs }, // Sustained spike
      { duration: "30s", target: normalVUs }, // Back to normal
      { duration: "1m", target: 0 }, // Ramp down
    ],
    gracefulRampDown: "30s",
  }),
};

/**
 * Predefined threshold configurations for different performance requirements
 */
export const thresholdPresets = {
  /**
   * Strict: High performance requirements
   */
  strict: {
    http_req_duration: ["p(95)<200", "p(99)<500"],
    http_req_failed: ["rate<0.001"], // 0.1% failure rate
  },

  /**
   * Standard: Normal performance requirements (default)
   */
  standard: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"], // 1% failure rate
  },

  /**
   * Relaxed: Lower performance requirements
   */
  relaxed: {
    http_req_duration: ["p(95)<1000", "p(99)<2000"],
    http_req_failed: ["rate<0.05"], // 5% failure rate
  },
};

/**
 * Helper function to create custom thresholds for specific operations
 *
 * @param {object} operationThresholds - Object mapping operation names to threshold arrays
 * @returns {object} Formatted thresholds object for k6
 *
 * @example
 * const customThresholds = createOperationThresholds({
 *   "Create Post": ["p(95)<300"],
 *   "Get All Posts": ["p(95)<200"],
 *   "Delete Post": ["p(95)<100"]
 * });
 */
export function createOperationThresholds(operationThresholds) {
  const thresholds = {};

  for (const [operation, thresholdArray] of Object.entries(operationThresholds)) {
    // Convert operation name to k6 metric name format
    const metricName = `http_req_duration{operation:${operation}}`;
    thresholds[metricName] = thresholdArray;
  }

  return thresholds;
}
