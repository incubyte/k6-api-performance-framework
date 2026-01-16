import { config } from "../../config.js";

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
 * ENVIRONMENT VARIABLE SUPPORT:
 * - API key is read from config.js which supports environment variables
 * - Override at runtime: k6 run -e API_KEY=your-key scenarios/smoke-test.js
 *
 * AUTHENTICATION PATTERNS:
 * This class supports multiple authentication patterns. Choose the one that fits your API:
 *
 * Pattern 1: API Key Authentication (Current Implementation)
 * - API key passed in custom header (x-api-key)
 * - Configure via environment variable: -e API_KEY=your-key
 *
 * Pattern 2: Bearer Token Authentication
 * @example
 * constructor() {
 *     super();
 *     // Override in child class if you need bearer token auth
 *     const token = config.apiKey; // or config.authToken
 *     this.baseHeaders = {
 *         "Authorization": `Bearer ${token}`,
 *         "Content-Type": "application/json"
 *     };
 * }
 *
 * Pattern 3: Basic Authentication
 * @example
 * import encoding from 'k6/encoding';
 *
 * constructor() {
 *     super();
 *     const username = __ENV.API_USERNAME || "user";
 *     const password = __ENV.API_PASSWORD || "pass";
 *     const credentials = encoding.b64encode(`${username}:${password}`);
 *     this.baseHeaders = {
 *         "Authorization": `Basic ${credentials}`,
 *         "Content-Type": "application/json"
 *     };
 * }
 *
 * Pattern 4: OAuth 2.0 / Dynamic Token
 * @example
 * constructor() {
 *     super();
 *     this.authToken = null;
 * }
 *
 * authenticate() {
 *     // Call auth endpoint to get token
 *     const authResponse = http.post(
 *         `${config.baseUrl}/oauth/token`,
 *         JSON.stringify({
 *             client_id: __ENV.CLIENT_ID,
 *             client_secret: __ENV.CLIENT_SECRET,
 *             grant_type: "client_credentials"
 *         })
 *     );
 *     this.authToken = authResponse.json().access_token;
 * }
 *
 * getAuthHeaders() {
 *     if (!this.authToken) {
 *         this.authenticate();
 *     }
 *     return {
 *         "Authorization": `Bearer ${this.authToken}`,
 *         "Content-Type": "application/json"
 *     };
 * }
 *
 * Pattern 5: Session Cookie Authentication
 * @example
 * constructor() {
 *     super();
 *     this.sessionCookie = null;
 * }
 *
 * login() {
 *     const loginResponse = http.post(
 *         `${config.baseUrl}/login`,
 *         JSON.stringify({
 *             username: __ENV.USERNAME,
 *             password: __ENV.PASSWORD
 *         })
 *     );
 *     // Extract session cookie from response
 *     this.sessionCookie = loginResponse.cookies.sessionId[0].value;
 * }
 *
 * getAuthHeaders() {
 *     return {
 *         "Cookie": `sessionId=${this.sessionCookie}`,
 *         "Content-Type": "application/json"
 *     };
 * }
 *
 * @see PostsOperations.js for complete implementation example
 */
export default class BaseOperations {
  constructor() {
    /**
     * Base headers used for all API requests
     * Uses config.apiKey which supports environment variable override
     * Override in child class if different headers needed
     */
    this.baseHeaders = {
      "x-api-key": config.apiKey,
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
   * - retry() - Retry logic for failed requests
   *
   * Keep helpers minimal - only add if used by 3+ operation classes
   */
}
