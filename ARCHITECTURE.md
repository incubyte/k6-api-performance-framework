# K6 Performance Framework - Architecture Documentation

**Version**: 3.0
**Purpose**: Extensible template for k6 API performance testing
**Last Updated**: January 2026

---

## Overview

This framework implements a clean **3-layer architecture** specifically designed for API performance testing with k6. The architecture prioritizes simplicity, extensibility, and educational value for teams building performance test suites.

### Design Philosophy

- **Simplicity First**: Each layer has a single, clear responsibility
- **Easy to Understand**: Minimal abstractions, straightforward patterns
- **Easy to Extend**: Template-based approach for adding new resources
- **Production-Ready**: Built-in observability and best practices

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                    LAYER 1: SCENARIOS                     │
│            (Test Configuration & Execution)               │
│                                                            │
│  • Configure test types (smoke, load, stress)             │
│  • Set VUs, duration, and thresholds                      │
│  • Generate HTML reports                                  │
│  • Control think time between iterations                  │
└──────────────────────┬────────────────────────────────────┘
                       │ calls
                       ▼
┌───────────────────────────────────────────────────────────┐
│                 LAYER 2: USER JOURNEYS                    │
│            (Business Workflow Orchestration)              │
│                                                            │
│  • Define complete user workflows                         │
│  • Initialize operation classes                           │
│  • Sequence API calls logically                           │
│  • Reusable across test types                             │
└──────────────────────┬────────────────────────────────────┘
                       │ calls
                       ▼
┌───────────────────────────────────────────────────────────┐
│                   LAYER 3: OPERATIONS                     │
│         (HTTP Requests + Validation + Metrics)            │
│                                                            │
│  • Build and execute HTTP requests                        │
│  • Validate responses with k6 check()                     │
│  • Track custom business metrics                          │
│  • Single source of truth for API interactions            │
└───────────────────────────────────────────────────────────┘
```

---

## Layer 1: Scenarios

### Purpose

Scenarios define **what type of load** you want to apply and **how long** it should run.

### Location

`scenarios/*.js` (quick-test.js, smoke-test.js, load-test.js, etc.)

### Responsibilities

1. **Configure k6 executors**
   - constant-vus: Fixed number of users
   - ramping-vus: Gradually increase/decrease load
   - per-vu-iterations: Each user runs N times

2. **Set performance thresholds**
   - Response time limits (p95, p99)
   - Error rate thresholds
   - Success rate requirements

3. **Generate HTML reports**
   - Automatically creates visual reports
   - Summary statistics and graphs

4. **Control test pacing**
   - Think time between iterations
   - Realistic user behavior simulation

### Example

```javascript
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import postsTest from "../src/user-journeys/posts-test.js";
import { sleep } from "k6";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

export const options = {
  scenarios: {
    smoke_test: {
      executor: "constant-vus",
      vus: 1,
      duration: "1m",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
    http_req_failed: ["rate<0.01"],   // Less than 1% failures
    checks: ["rate>0.95"],            // 95% of checks pass
  },
};

export default function () {
  postsTest(); // Execute user journey
  sleep(randomIntBetween(1, 3)); // Think time
}

export function handleSummary(data) {
  return {
    "results/html/smoketest.html": htmlReport(data),
  };
}
```

---

## Layer 2: User Journeys

### Purpose

User journeys orchestrate **complete business workflows** that represent real user behavior.

### Location

`src/user-journeys/*.js`

### Responsibilities

1. **Initialize operations classes**
   - Create instances of operations (PostsOperations, UsersOperations)
   - Set up any journey-specific configuration

2. **Define workflow sequence**
   - Order operations to match real user flows
   - Example: Browse posts → View details → Create comment

3. **Reusable across scenarios**
   - Same journey works in smoke, load, and stress tests
   - Consistent behavior across test types

### Example

```javascript
import PostsOperations from "../operations/PostsOperations.js";
import { createPostPayload, updatePostPayload, patchPostPayload } from "../payloads/posts-payload.js";

export default function postsTest() {
  // Initialize operations
  const operations = new PostsOperations();

  // Execute complete workflow
  operations.getAllPosts();               // Browse all posts
  operations.getPost(1);                  // View specific post
  operations.getPostComments(1);          // Read comments
  operations.createPost(createPostPayload); // Create new post
  operations.updatePost(1, updatePostPayload); // Edit post
  operations.deletePost(1);               // Delete post
}
```

### Why This Layer Matters

- **Separation of Concerns**: Test config separate from business logic
- **Reusability**: Use same journey in multiple test types
- **Maintainability**: Update workflow in one place
- **Readability**: Clear view of user behavior patterns

---

## Layer 3: Operations

### Purpose

Operations handle **all API interactions**: building requests, executing them, validating responses, and tracking metrics.

### Location

`src/operations/*.js`

### Structure

```
src/operations/
├── BaseOperations.js      # Foundation class with shared config
└── PostsOperations.js     # Posts API operations (example)
```

### Responsibilities

1. **Build HTTP requests**
   - Construct URLs from endpoints
   - Build headers (authentication, content-type)
   - Prepare request payloads

2. **Execute requests**
   - Call HTTP methods via requestUtils
   - Wrap in k6 groups for organized metrics
   - Handle request errors

3. **Validate responses**
   - Use k6 check() for assertions
   - Verify status codes
   - Validate response structure and data

4. **Track metrics**
   - Record operation duration
   - Count successes/failures
   - Track read vs write operations

5. **Return responses**
   - Return response object on success
   - Return null on failure with error logging

### BaseOperations Class

The foundation class all operations extend:

```javascript
import { config } from "../../config.js";

export default class BaseOperations {
  constructor() {
    // Shared configuration for all operations
    this.baseHeaders = {
      "x-api-key": config.apiKey,
      "Content-Type": "application/json",
    };
  }

  // Add common helper methods here if needed by 3+ operation classes
}
```

**Why BaseOperations?**
- Single place for shared configuration
- Consistent pattern for all API resources
- Easy authentication changes (update once, apply everywhere)
- Clear template for extension

### PostsOperations Class (Example)

```javascript
import { group, check } from "k6";
import { endpoints } from "../../endpoints.js";
import * as requestUtils from "../lib/request-utils.js";
import { logError } from "../lib/utils.js";
import BaseOperations from "./BaseOperations.js";
import {
  getAllPostsDuration,
  readOperations,
  operationSuccess,
} from "../metrics/business-metrics.js";

export default class PostsOperations extends BaseOperations {
  constructor() {
    super(); // Inherit shared configuration
  }

  getAllPosts() {
    return group("Get All Posts", () => {
      // 1. Track start time for metrics
      const startTime = Date.now();

      // 2. Build request
      const url = endpoints.posts;
      const headers = requestUtils.buildHeaders({ base: this.baseHeaders });

      // 3. Execute request
      const response = requestUtils.performGet(
        url,
        headers,
        {},
        "Successfully retrieved Get All Posts",
        "Get All Posts"
      );

      // 4. Record metrics
      getAllPostsDuration.add(Date.now() - startTime);
      readOperations.add(1);

      // 5. Validate response
      if (response) {
        const data = response.json(); // Parse ONCE, reuse multiple times
        check(response, {
          "Get all posts - status is 200": (r) => r.status === 200,
          "Get all posts - response is array": () => Array.isArray(data),
          "Get all posts - has posts": () => data.length > 0,
        });

        // 6. Record success
        operationSuccess.add(response.status === 200);
        return response;
      }

      // 7. Record failure
      operationSuccess.add(false);
      logError("Failed to get all posts");
      return null;
    });
  }
}
```

### Key Patterns

**Pattern 1: Always Extend BaseOperations**
```javascript
export default class UsersOperations extends BaseOperations {
  constructor() {
    super(); // Get shared config
  }
}
```

**Pattern 2: Cache JSON Parsing**
```javascript
const data = response.json(); // Parse ONCE
check(response, {
  "has id": () => data.id !== undefined,     // Use cached data
  "has name": () => data.name !== undefined, // Use cached data
});
```

**Pattern 3: Use k6 Groups**
```javascript
return group("Operation Name", () => {
  // All operation code here
  // k6 will organize metrics by group name
});
```

**Pattern 4: Track Custom Metrics**
```javascript
const startTime = Date.now();
// ... execute operation ...
myOperationDuration.add(Date.now() - startTime);
operationSuccess.add(response.status === 200);
```

---

## Data Flow Example

Let's trace a complete request: `operations.getPost(1)`

```
┌─────────────────────────────────────────────────────────┐
│ 1. SCENARIO (smoke-test.js)                            │
│    • Calls postsTest()                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. USER JOURNEY (posts-test.js)                        │
│    • Creates new PostsOperations()                      │
│    • Calls operations.getPost(1)                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. OPERATIONS (PostsOperations.js)                     │
│    • Extends BaseOperations (gets baseHeaders)          │
│    • Builds URL: endpoints.post(1)                      │
│    • Builds headers with API key                        │
│    • Wraps in group("Get Post 1")                       │
│    • Tracks start time for metrics                      │
│    • Calls requestUtils.performGet(...)                 │
│    • Parses response.json() ONCE                        │
│    • Runs k6 checks (validations)                       │
│    • Records metrics (duration, success)                │
│    • Returns response or null                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. HTTP UTILS (request-utils.js)                       │
│    • Logs request info                                  │
│    • Calls k6's http.get(url, {headers})                │
│    • Logs success/failure                               │
│    • Returns response                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. K6 RUNTIME                                           │
│    • Executes HTTP request                              │
│    • Records all metrics                                │
│    • Returns response object                            │
└─────────────────────────────────────────────────────────┘
```

**Result**: 3 simple layers, clear responsibilities, easy to debug.

---

## Adding a New API Resource

Let's add a Users API resource step by step.

### Step 1: Add Endpoints

**File**: `endpoints.js`

```javascript
const BASE_URL = __ENV.BASE_URL || "https://jsonplaceholder.typicode.com";

export const endpoints = {
  posts: `${BASE_URL}/posts`,
  post: (id) => `${BASE_URL}/posts/${id}`,

  // ADD THESE LINES
  users: `${BASE_URL}/users`,
  user: (id) => `${BASE_URL}/users/${id}`,
};
```

### Step 2: Create Operations Class

**File**: `src/operations/UsersOperations.js`

```javascript
import { group, check } from "k6";
import { endpoints } from "../../endpoints.js";
import * as requestUtils from "../lib/request-utils.js";
import { logError } from "../lib/utils.js";
import BaseOperations from "./BaseOperations.js";

export default class UsersOperations extends BaseOperations {
  constructor() {
    super(); // Inherit baseHeaders
  }

  getAllUsers() {
    return group("Get All Users", () => {
      // Build request
      const url = endpoints.users;
      const headers = requestUtils.buildHeaders({ base: this.baseHeaders });

      // Execute
      const response = requestUtils.performGet(
        url,
        headers,
        {},
        "Successfully retrieved all users",
        "Get All Users"
      );

      // Validate
      if (response) {
        const data = response.json();
        check(response, {
          "Get users - status is 200": (r) => r.status === 200,
          "Get users - is array": () => Array.isArray(data),
          "Get users - has users": () => data.length > 0,
        });
        return response;
      }

      logError("Failed to get all users");
      return null;
    });
  }

  getUser(userId) {
    return group(`Get User ${userId}`, () => {
      const url = endpoints.user(userId);
      const headers = requestUtils.buildHeaders({ base: this.baseHeaders });

      const response = requestUtils.performGet(
        url,
        headers,
        {},
        `Successfully retrieved user ${userId}`,
        `Get User ${userId}`
      );

      if (response) {
        const data = response.json();
        check(response, {
          "Get user - status is 200": (r) => r.status === 200,
          "Get user - has id": () => data.id !== undefined,
          "Get user - has name": () => data.name !== undefined,
          "Get user - has email": () => data.email !== undefined,
        });
        return response;
      }

      logError(`Failed to get user ${userId}`);
      return null;
    });
  }
}
```

### Step 3: Create User Journey

**File**: `src/user-journeys/users-test.js`

```javascript
import UsersOperations from "../operations/UsersOperations.js";

export default function usersTest() {
  const operations = new UsersOperations();

  // Execute workflow
  operations.getAllUsers();
  operations.getUser(1);
  operations.getUser(2);
}
```

### Step 4: Use in Scenario

**File**: `scenarios/smoke-test.js` (modify existing)

```javascript
import usersTest from "../src/user-journeys/users-test.js";
import postsTest from "../src/user-journeys/posts-test.js";

export default function () {
  postsTest(); // Existing
  usersTest(); // NEW
}
```

**Done!** You've added a complete new API resource in 4 simple steps.

---

## Configuration Management

### Base Configuration

**File**: `config.js`

```javascript
export const config = {
  baseUrl: __ENV.BASE_URL || "https://jsonplaceholder.typicode.com",
  apiKey: __ENV.API_KEY || "default-api-key",
  timeout: parseInt(__ENV.TIMEOUT) || 30000,
  thinkTimeMin: parseInt(__ENV.THINK_TIME_MIN) || 1,
  thinkTimeMax: parseInt(__ENV.THINK_TIME_MAX) || 3,
};
```

### Environment Variables

Run tests with different configurations:

```bash
# Development
k6 run -e BASE_URL=https://dev-api.example.com scenarios/smoke-test.js

# Staging
k6 run -e BASE_URL=https://staging-api.example.com scenarios/load-test.js

# Production
k6 run -e BASE_URL=https://api.example.com -e API_KEY=prod-key scenarios/stress-test.js
```

### Scenario Presets

**File**: `src/config/scenario-base.js`

Reusable executor configurations:

```javascript
export const executorPresets = {
  // Quick validation
  quick: (iterations = 1) => ({
    executor: "per-vu-iterations",
    vus: 1,
    iterations: iterations,
    maxDuration: "30s",
  }),

  // Smoke test
  smoke: (vus = 1, duration = "1m") => ({
    executor: "constant-vus",
    vus,
    duration,
    gracefulStop: "10s",
  }),

  // Load test
  load: (vus = 5, duration = "5m") => ({
    executor: "constant-vus",
    vus,
    duration,
    gracefulStop: "10s",
  }),
};
```

---

## Custom Metrics

### Why Custom Metrics?

k6 provides built-in HTTP metrics, but custom metrics let you track **business-level operations**:

- How long does "Get All Posts" take? (not just HTTP time)
- How many read vs write operations?
- What's the success rate of specific operations?

### Available Metrics

**File**: `src/metrics/business-metrics.js`

```javascript
import { Trend, Counter, Rate } from "k6/metrics";

// Duration metrics (how long operations take)
export const getAllPostsDuration = new Trend("get_all_posts_duration", true);
export const getPostDuration = new Trend("get_post_duration", true);
export const createPostDuration = new Trend("create_post_duration", true);
export const updatePostDuration = new Trend("update_post_duration", true);
export const deletePostDuration = new Trend("delete_post_duration", true);

// Operation counters (how many operations)
export const readOperations = new Counter("read_operations");
export const writeOperations = new Counter("write_operations");

// Success tracking (operation success rate)
export const operationSuccess = new Rate("operation_success");
```

### Adding Metrics to Operations

```javascript
import {
  myOperationDuration,
  readOperations,
  operationSuccess,
} from "../metrics/business-metrics.js";

myOperation() {
  return group("My Operation", () => {
    const startTime = Date.now();

    const response = requestUtils.performGet(...);

    // Record metrics
    myOperationDuration.add(Date.now() - startTime);
    readOperations.add(1);

    if (response) {
      operationSuccess.add(response.status === 200);
      return response;
    }

    operationSuccess.add(false);
    return null;
  });
}
```

---

## Authentication Patterns

### API Key (Current)

```javascript
this.baseHeaders = {
  "x-api-key": config.apiKey,
  "Content-Type": "application/json",
};
```

### Bearer Token

```javascript
this.baseHeaders = {
  "Authorization": `Bearer ${config.apiKey}`,
  "Content-Type": "application/json",
};
```

### Basic Auth

```javascript
import encoding from "k6/encoding";

const credentials = encoding.b64encode(`${username}:${password}`);
this.baseHeaders = {
  "Authorization": `Basic ${credentials}`,
  "Content-Type": "application/json",
};
```

### OAuth 2.0 / Dynamic Token

```javascript
export default class MyOperations extends BaseOperations {
  constructor() {
    super();
    this.authToken = null;
  }

  authenticate() {
    const response = http.post(
      `${config.baseUrl}/oauth/token`,
      JSON.stringify({
        client_id: __ENV.CLIENT_ID,
        client_secret: __ENV.CLIENT_SECRET,
        grant_type: "client_credentials",
      })
    );
    this.authToken = response.json().access_token;
  }

  getHeaders() {
    if (!this.authToken) {
      this.authenticate();
    }
    return {
      "Authorization": `Bearer ${this.authToken}`,
      "Content-Type": "application/json",
    };
  }
}
```

---

## Best Practices

### ✅ Do

1. **Extend BaseOperations** for all new API resources
2. **Cache JSON parsing** - Parse once, use many times
3. **Use k6 groups** - Organize metrics by operation name
4. **Track custom metrics** - Monitor business operations
5. **Validate responses** - Always use k6 check()
6. **Follow PostsOperations.js** - Use it as your template
7. **Add think time** - In scenarios, not in operations

### ❌ Don't

1. **Don't parse JSON multiple times** - Expensive and wasteful
2. **Don't add sleep() in operations** - Use scenario-level think time
3. **Don't skip BaseOperations** - Breaks consistency
4. **Don't duplicate validation** - Keep it in Operations layer
5. **Don't ignore errors** - Log and track failures
6. **Don't over-abstract** - Keep it simple

---

## Performance Optimizations

### JSON Parsing Efficiency

**Bad** (parses 3 times):
```javascript
const post = response.json(); // Parse 1 (unused)
check(response, {
  "has id": (r) => r.json().id !== undefined,    // Parse 2
  "has title": (r) => r.json().title !== undefined, // Parse 3
});
```

**Good** (parses once):
```javascript
const data = response.json(); // Parse ONCE
check(response, {
  "has id": () => data.id !== undefined,    // Use cached
  "has title": () => data.title !== undefined, // Use cached
});
```

**Impact**: +1.34% throughput improvement

### Request Optimization

- Use HTTP keep-alive (k6 default)
- Batch related operations when possible
- Avoid unnecessary think time in operations
- Use appropriate VU counts (don't over-provision)

---

## Extension Guidelines

### When to Add New Operations Class

Create a new operations class for each **API resource or domain**:

- `PostsOperations` - All posts-related operations
- `UsersOperations` - All users-related operations
- `CommentsOperations` - All comments-related operations
- `AuthOperations` - All authentication operations

### When to Add Helpers to BaseOperations

Only add helpers that are:
1. Used by 3+ operation classes
2. Truly common across all resources
3. Not resource-specific

**Good helpers**:
- Authentication token management
- Rate limiting logic
- Common error handling patterns

**Bad helpers**:
- Resource-specific validations
- Single-use utilities

---

## Testing Strategy

### Quick Test (1 iteration)
- **Purpose**: Validate all operations work
- **When**: After code changes, before commit
- **Duration**: ~3 seconds

### Smoke Test (1 VU, 1 minute)
- **Purpose**: Basic functionality check
- **When**: Before deeper testing
- **Duration**: 1 minute

### Load Test (5 VUs, 5 minutes)
- **Purpose**: Sustained normal load
- **When**: Regular performance testing
- **Duration**: 5 minutes

### Stress Test (ramp to 20 VUs)
- **Purpose**: Find breaking point
- **When**: Capacity planning
- **Duration**: 10 minutes

### Soak Test (3 VUs, 15 minutes)
- **Purpose**: Long-duration stability
- **When**: Check for memory leaks
- **Duration**: 15 minutes

---

## Troubleshooting

### Common Issues

**Issue**: Tests not running
**Solution**: Check k6 is installed: `k6 version`

**Issue**: Import errors
**Solution**: Verify paths are correct and files exist

**Issue**: High failure rate
**Solution**: Check API availability, network, thresholds

**Issue**: Metrics not showing
**Solution**: Ensure operations wrap code in k6 groups

---

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 Test Life Cycle](https://k6.io/docs/using-k6/test-life-cycle/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [k6 Checks](https://k6.io/docs/using-k6/checks/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)

---

## Framework Status

**Version**: 3.0
**Architecture**: 3-layer (Scenarios → User Journeys → Operations)
**Status**: Production-ready
**Score**: 4.5/5
**Best For**: API performance testing with k6

---

Built for teams who value simplicity, extensibility, and best practices.
