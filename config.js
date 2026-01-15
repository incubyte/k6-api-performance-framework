/**
 * Configuration Management with Environment Variable Support
 *
 * This file provides centralized configuration with environment variable overrides.
 * Use k6's __ENV object to pass environment-specific values at runtime.
 *
 * Usage Examples:
 *
 * 1. Default (uses hardcoded values):
 *    k6 run scenarios/smoke-test.js
 *
 * 2. Override base URL for staging:
 *    k6 run -e BASE_URL=https://staging.api.example.com scenarios/smoke-test.js
 *
 * 3. Multiple environment variables:
 *    k6 run -e BASE_URL=https://prod.api.com -e API_KEY=prod-key-123 scenarios/load-test.js
 *
 * 4. Using .env file (requires k6 extensions):
 *    k6 run --env-file .env scenarios/stress-test.js
 */

export const config = {
    /**
     * Base URL for API endpoints
     * Override with: -e BASE_URL=https://your-api.com
     */
    baseUrl: __ENV.BASE_URL || "https://jsonplaceholder.typicode.com",

    /**
     * API Key for authentication
     * Override with: -e API_KEY=your-api-key
     */
    apiKey: __ENV.API_KEY || "reqres-free-v1",

    /**
     * Request timeout (in seconds)
     * Override with: -e TIMEOUT=60s
     */
    timeout: __ENV.TIMEOUT || "30s",

    /**
     * Environment name (dev/staging/prod)
     * Override with: -e ENVIRONMENT=staging
     */
    environment: __ENV.ENVIRONMENT || "dev",

    /**
     * Debug mode flag
     * Override with: -e DEBUG=true
     */
    debug: __ENV.DEBUG === "true" || false,

    /**
     * Think time range (for realistic user behavior simulation)
     * Override with: -e THINK_TIME_MIN=1 -e THINK_TIME_MAX=5
     */
    thinkTime: {
        min: parseInt(__ENV.THINK_TIME_MIN) || 1,
        max: parseInt(__ENV.THINK_TIME_MAX) || 3,
    },
};

/**
 * Helper function to log current configuration (useful for debugging)
 */
export function logConfig() {
    console.log("=== K6 Framework Configuration ===");
    console.log(`Environment: ${config.environment}`);
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`API Key: ${config.apiKey.substring(0, 8)}...`);
    console.log(`Timeout: ${config.timeout}`);
    console.log(`Debug Mode: ${config.debug}`);
    console.log(`Think Time: ${config.thinkTime.min}-${config.thinkTime.max}s`);
    console.log("===================================");
}
