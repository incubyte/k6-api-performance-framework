import { Trend, Counter, Rate } from "k6/metrics";

/**
 * Business Metrics for Performance Testing
 *
 * Custom metrics provide operation-level tracking beyond k6's default HTTP metrics.
 * These enable SLO monitoring, detailed performance insights, and business-specific metrics.
 *
 * Benefits:
 * - Track individual operation performance
 * - Monitor operation-specific SLOs
 * - Identify slow operations at a glance
 * - Separate read vs write operation performance
 *
 * Usage:
 * import { createPostDuration, operationSuccess } from "../metrics/business-metrics.js";
 *
 * // Track operation duration
 * const startTime = Date.now();
 * const response = performPost(...);
 * createPostDuration.add(Date.now() - startTime);
 *
 * // Track operation success/failure
 * operationSuccess.add(response && response.status === 201);
 *
 * Viewing Metrics:
 * - Metrics appear in k6 output as custom metrics
 * - Set thresholds: thresholds: { "create_post_duration": ["p(95)<300"] }
 * - View in Grafana/k6 Cloud with tagged metrics
 */

// ============================================================================
// Posts Operation Metrics
// ============================================================================

/**
 * Get All Posts - Duration tracking
 * Tracks time to fetch all posts (list operation)
 * SLO Target: p95 < 200ms
 */
export const getAllPostsDuration = new Trend("get_all_posts_duration", true);

/**
 * Get Single Post - Duration tracking
 * Tracks time to fetch individual post (detail operation)
 * SLO Target: p95 < 150ms
 */
export const getPostDuration = new Trend("get_post_duration", true);

/**
 * Create Post - Duration tracking
 * Tracks time to create a new post (write operation)
 * SLO Target: p95 < 300ms
 */
export const createPostDuration = new Trend("create_post_duration", true);

/**
 * Update Post - Duration tracking
 * Tracks time to update existing post (write operation)
 * SLO Target: p95 < 250ms
 */
export const updatePostDuration = new Trend("update_post_duration", true);

/**
 * Patch Post - Duration tracking
 * Tracks time to partially update post (write operation)
 * SLO Target: p95 < 200ms
 */
export const patchPostDuration = new Trend("patch_post_duration", true);

/**
 * Delete Post - Duration tracking
 * Tracks time to delete post (write operation)
 * SLO Target: p95 < 100ms
 */
export const deletePostDuration = new Trend("delete_post_duration", true);

/**
 * Get Post Comments - Duration tracking
 * Tracks time to fetch comments for a post (list operation)
 * SLO Target: p95 < 250ms
 */
export const getPostCommentsDuration = new Trend("get_post_comments_duration", true);

/**
 * Get Posts by User - Duration tracking
 * Tracks time to fetch posts filtered by user (filtered list operation)
 * SLO Target: p95 < 200ms
 */
export const getPostsByUserDuration = new Trend("get_posts_by_user_duration", true);

// ============================================================================
// Operation Success/Failure Tracking
// ============================================================================

/**
 * Operation Success Rate
 * Tracks successful operations (status 2xx)
 * SLO Target: > 99%
 */
export const operationSuccess = new Rate("operation_success_rate");

/**
 * Operation Failure Counter
 * Counts failed operations for alerting
 * SLO Target: < 10 failures per test run
 */
export const operationFailures = new Counter("operation_failures");

/**
 * Validation Failure Rate
 * Tracks k6 check() validation failures
 * SLO Target: 0%
 */
export const validationFailures = new Rate("validation_failure_rate");

// ============================================================================
// Business-Specific Metrics (Examples)
// ============================================================================

/**
 * Read Operations Count
 * Counts total read operations (GET requests)
 * Use for: Read/write ratio analysis
 */
export const readOperations = new Counter("read_operations_total");

/**
 * Write Operations Count
 * Counts total write operations (POST/PUT/PATCH/DELETE)
 * Use for: Read/write ratio analysis
 */
export const writeOperations = new Counter("write_operations_total");

/**
 * Data Transfer Size
 * Tracks total data transferred (bytes)
 * Use for: Bandwidth analysis, cost estimation
 */
export const dataTransferred = new Counter("data_transferred_bytes");

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Track operation with automatic success/failure recording
 *
 * @param {Trend} durationMetric - The duration metric to record to
 * @param {function} operation - The operation to execute
 * @param {boolean} isRead - Whether this is a read operation (vs write)
 * @returns {*} Result of the operation
 *
 * @example
 * const response = trackOperation(
 *     createPostDuration,
 *     () => requestUtils.performPost(url, payload, headers),
 *     false // write operation
 * );
 */
export function trackOperation(durationMetric, operation, isRead = true) {
  const startTime = Date.now();

  try {
    const result = operation();
    const duration = Date.now() - startTime;

    // Record duration
    durationMetric.add(duration);

    // Record success/failure
    const success = result && result.status >= 200 && result.status < 300;
    operationSuccess.add(success);

    if (!success) {
      operationFailures.add(1);
    }

    // Record operation type
    if (isRead) {
      readOperations.add(1);
    } else {
      writeOperations.add(1);
    }

    // Record data transfer (if response has body)
    if (result && result.body) {
      dataTransferred.add(result.body.length);
    }

    return result;
  } catch (error) {
    // Record failure
    operationSuccess.add(false);
    operationFailures.add(1);

    throw error;
  }
}

/**
 * Create custom metric thresholds for scenarios
 *
 * @returns {object} Thresholds object for k6 options
 *
 * @example
 * import { getBusinessMetricThresholds } from "../src/metrics/business-metrics.js";
 *
 * export const options = {
 *     thresholds: {
 *         ...getBusinessMetricThresholds(),
 *         // Add your own thresholds...
 *     }
 * };
 */
export function getBusinessMetricThresholds() {
  return {
    // Operation duration thresholds (p95 targets)
    get_all_posts_duration: ["p(95)<200"],
    get_post_duration: ["p(95)<150"],
    create_post_duration: ["p(95)<300"],
    update_post_duration: ["p(95)<250"],
    patch_post_duration: ["p(95)<200"],
    delete_post_duration: ["p(95)<100"],
    get_post_comments_duration: ["p(95)<250"],
    get_posts_by_user_duration: ["p(95)<200"],

    // Success rate thresholds
    operation_success_rate: ["rate>0.99"], // 99% success rate
    validation_failure_rate: ["rate==0"], // 0% validation failures
  };
}
