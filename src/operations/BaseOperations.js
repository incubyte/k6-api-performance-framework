import { group, check } from "k6";
import * as requestUtils from "../lib/request-utils.js";
import { logError } from "../lib/utils.js";

/**
 * BaseOperations - Foundation class for all API operations
 *
 * This class provides shared configuration and common patterns for API testing.
 * All resource-specific operations (Posts, Users, Comments, etc.) should extend this class.
 *
 * ARCHITECTURE PATTERN:
 * Each operation method follows this structure:
 * 1. Wrap in k6 group() for metrics organization
 * 2. Build request (URL, headers, payload)
 * 3. Execute request via requestUtils
 * 4. Validate response with k6 check()
 * 5. Return response or null on failure
 *
 * EXTENDING THIS CLASS:
 * To add a new API resource (e.g., Users, Comments, Albums):
 *
 * Step 1: Create new file in src/operations/
 * @example
 * // src/operations/UsersOperations.js
 * import BaseOperations from "./BaseOperations.js";
 * import { endpoints } from "../../endpoints.js";
 *
 * export default class UsersOperations extends BaseOperations {
 *     getAllUsers() {
 *         return group("Get All Users", () => {
 *             // Build request
 *             const url = endpoints.users;
 *             const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
 *
 *             // Execute request
 *             const response = requestUtils.performGet(
 *                 url, headers, {},
 *                 "Successfully retrieved all users",
 *                 "Get All Users"
 *             );
 *
 *             // Validate response
 *             if (response) {
 *                 const data = response.json();
 *                 check(response, {
 *                     "Get users - status is 200": (r) => r.status === 200,
 *                     "Get users - is array": () => Array.isArray(data),
 *                 });
 *                 return response;
 *             }
 *             logError("Failed to get all users");
 *             return null;
 *         });
 *     }
 * }
 *
 * Step 2: Add endpoints to endpoints.js
 * @example
 * export const endpoints = {
 *     users: `${BASE_URL}/users`,
 *     user: (id) => `${BASE_URL}/users/${id}`,
 * };
 *
 * Step 3: Use in your user journey
 * @example
 * import UsersOperations from "../operations/UsersOperations.js";
 *
 * export default function usersTest() {
 *     const operations = new UsersOperations();
 *     operations.getAllUsers();
 * }
 *
 * SHARED CONFIGURATION:
 * - baseHeaders: Common headers (API key, Content-Type) for all requests
 * - Extend constructor to add resource-specific configuration
 *
 * @see PostsOperations.js for complete implementation example
 */
export default class BaseOperations {
    constructor() {
        /**
         * Base headers used for all API requests
         * Override in child class if different headers needed
         */
        this.baseHeaders = {
            "x-api-key": "reqres-free-v1",
            "Content-Type": "application/json",
        };
    }

    /**
     * Optional: Add common helper methods here
     *
     * Example helper methods you might add:
     * - buildRequestHeaders() - Custom header building logic
     * - validateStandardResponse() - Common validation patterns
     * - handleAuthToken() - Token management for authenticated requests
     *
     * Keep helpers minimal - only add if used by 3+ operation classes
     */
}
