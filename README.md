# K6 API Performance Framework

A production-ready k6 performance testing framework with a clean 3-layer architecture. Built as a template for API performance testing projects with comprehensive observability and extensibility.

---

## Quick Start

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/

# Clone this repository
git clone https://github.com/incubyte/k6-api-performance-framework.git
cd k6-api-performance-framework

# Run quick validation test (1 iteration, ~3 seconds)
npm run test:quick

# Run smoke test (1 VU, 1 minute)
npm run test:smoke

# Run load test (5 VUs, 5 minutes)
npm run test:load
```

---

## What is This Framework?

This is a **plug-and-play k6 framework** designed to help you quickly set up API performance testing for your projects. It provides:

- ✅ **Clean Architecture**: 3-layer pattern that's easy to understand and extend
- ✅ **Complete Observability**: Custom metrics integrated across all operations
- ✅ **Multiple Test Types**: Smoke, load, stress, soak, and quick validation tests
- ✅ **Extensible Design**: Simple pattern for adding new API resources
- ✅ **Environment Support**: Configuration via environment variables
- ✅ **Best Practices**: Built-in patterns following k6 recommendations

---

## Architecture Overview

The framework uses a simple, intuitive 3-layer architecture:

```
┌─────────────────────────────────────────┐
│         LAYER 1: Scenarios              │
│   (Test configuration & execution)      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       LAYER 2: User Journeys            │
│   (Business workflow orchestration)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        LAYER 3: Operations              │
│  (HTTP requests + validation + metrics) │
└─────────────────────────────────────────┘
```

### What Each Layer Does

**Scenarios** (`scenarios/*.js`)

- Define test types (smoke, load, stress, etc.)
- Configure VUs, duration, and thresholds
- Generate HTML reports

**User Journeys** (`src/user-journeys/*.js`)

- Orchestrate complete business workflows
- Define the sequence of operations
- Represent realistic user behavior

**Operations** (`src/operations/*.js`)

- Execute HTTP requests
- Validate responses
- Track custom metrics
- Single source of truth for API interactions

---

## Project Structure

```
k6-api-performance-framework/
├── scenarios/                  # Test configurations
│   ├── quick-test.js          # Fast validation (1 iteration)
│   ├── smoke-test.js          # Basic functionality (1 VU, 1m)
│   ├── load-test.js           # Sustained load (5 VUs, 5m)
│   ├── stress-test.js         # Breaking point (ramp to 20 VUs)
│   └── soak-test.js           # Stability (3 VUs, 15m)
├── src/
│   ├── user-journeys/         # Workflow orchestration
│   │   └── posts-test.js
│   ├── operations/            # API operations
│   │   ├── BaseOperations.js  # Shared configuration
│   │   └── PostsOperations.js # Posts API operations
│   ├── lib/                   # Utilities
│   │   ├── request-utils.js   # HTTP wrappers
│   │   └── utils.js           # Helper functions
│   ├── payloads/              # Test data
│   │   └── posts-payload.js
│   ├── metrics/               # Custom metrics
│   │   └── business-metrics.js
│   └── config/                # Shared configuration
│       └── scenario-base.js   # Reusable scenario presets
├── config.js                  # Base configuration
├── endpoints.js               # API endpoints
└── ARCHITECTURE.md            # Detailed architecture docs
```

---

## Test Types

| Test Type  | Purpose                  | Configuration           | When to Use                            |
| ---------- | ------------------------ | ----------------------- | -------------------------------------- |
| **Quick**  | Fast validation          | 1 VU, 1 iteration (~3s) | Verify tests work after code changes   |
| **Smoke**  | Basic functionality      | 1 VU, 1 minute          | Minimal load, validate core flows      |
| **Load**   | Sustained performance    | 5 VUs, 5 minutes        | Normal expected load                   |
| **Stress** | Find breaking point      | Ramp up to 20 VUs       | Determine system capacity limits       |
| **Soak**   | Long-duration stability  | 3 VUs, 15 minutes       | Memory leaks, performance degradation  |

---

## How to Extend This Framework

### Adding a New API Resource (e.g., Users)

#### Step 1: Add Endpoints (`endpoints.js`)

```javascript
export const endpoints = {
  posts: `${BASE_URL}/posts`,
  users: `${BASE_URL}/users`, // ADD THIS
  user: (id) => `${BASE_URL}/users/${id}`, // ADD THIS
};
```

#### Step 2: Create Operations Class (`src/operations/UsersOperations.js`)

```javascript
import { group, check } from "k6";
import { endpoints } from "../../endpoints.js";
import * as requestUtils from "../lib/request-utils.js";
import { logError } from "../lib/utils.js";
import BaseOperations from "./BaseOperations.js";

export default class UsersOperations extends BaseOperations {
  constructor() {
    super(); // Inherits baseHeaders and configuration
  }

  getAllUsers() {
    return group("Get All Users", () => {
      // Build request
      const url = endpoints.users;
      const headers = requestUtils.buildHeaders({ base: this.baseHeaders });

      // Execute request
      const response = requestUtils.performGet(
        url,
        headers,
        {},
        "Successfully retrieved all users",
        "Get All Users"
      );

      // Validate and return
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
}
```

#### Step 3: Create User Journey (`src/user-journeys/users-test.js`)

```javascript
import UsersOperations from "../operations/UsersOperations.js";

export default function usersTest() {
  const operations = new UsersOperations();

  // Execute operations
  operations.getAllUsers();
}
```

#### Step 4: Use in Scenario

```javascript
import usersTest from "../src/user-journeys/users-test.js";

export default function () {
  usersTest();
}
```

**That's it!** You've added a complete new API resource.

---

## Configuration

### Environment Variables

Configure the framework using environment variables:

```bash
# Set base URL
k6 run -e BASE_URL=https://api.yourcompany.com scenarios/smoke-test.js

# Set API key
k6 run -e API_KEY=your-api-key scenarios/smoke-test.js

# Multiple variables
k6 run -e BASE_URL=https://api.example.com -e API_KEY=key123 scenarios/load-test.js
```

### Using .env File (Optional)

Create a `.env` file:

```bash
BASE_URL=https://jsonplaceholder.typicode.com
API_KEY=your-api-key-here
TIMEOUT=30000
```

Then load it before running tests:

```bash
export $(cat .env | xargs)
k6 run scenarios/smoke-test.js
```

### Test Thresholds

Edit scenario files to customize performance thresholds:

```javascript
thresholds: {
  http_req_duration: ["p(95)<500"],    // 95% of requests < 500ms
  http_req_failed: ["rate<0.01"],      // Less than 1% failures
  checks: ["rate>0.95"],               // 95% of checks pass
}
```

---

## Running Tests

### NPM Scripts

```bash
# Quick validation (1 iteration)
npm run test:quick

# Individual test types
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:soak

# Run multiple tests
npm run test:all

# CI/CD mode (quiet output)
npm run test:ci

# Code quality
npm run lint          # Check code
npm run format        # Format code
npm run validate      # Format + lint
```

### Direct k6 Commands

```bash
# Run with custom VUs and duration
k6 run --vus 10 --duration 30s scenarios/load-test.js

# Run with detailed metrics
k6 run --summary-trend-stats="avg,min,med,max,p(95),p(99)" scenarios/smoke-test.js

# Run with environment variables
k6 run -e BASE_URL=https://api.example.com scenarios/load-test.js
```

### Viewing Results

HTML reports are automatically generated:

```bash
# macOS
open results/html/smoketest.html

# Linux
xdg-open results/html/smoketest.html

# Windows
start results/html/smoketest.html
```

---

## Custom Metrics

The framework includes built-in custom metrics for detailed observability:

### Operation Duration Metrics

Track how long each operation takes:

- `getAllPostsDuration`
- `getPostDuration`
- `createPostDuration`
- `updatePostDuration`
- `deletePostDuration`

### Operation Counters

Track operation counts:

- `readOperations` - Total read operations (GET)
- `writeOperations` - Total write operations (POST, PUT, DELETE)

### Success Rate

Track operation success:

- `operationSuccess` - Success/failure rate for all operations

### How to Add Metrics to New Operations

```javascript
import { Trend, Counter, Rate } from "k6/metrics";

// Define metrics
const myOperationDuration = new Trend("my_operation_duration", true);
const myOperationSuccess = new Rate("my_operation_success");

// Use in operation
const startTime = Date.now();
const response = requestUtils.performGet(url, headers, {}, "...", "...");
myOperationDuration.add(Date.now() - startTime);
myOperationSuccess.add(response.status === 200);
```

---

## Best Practices

### ✅ Do

- **Extend BaseOperations** for all new API resources
- **Cache JSON parsing**: `const data = response.json()` (call once, use multiple times)
- **Use k6 groups**: Organize metrics by operation
- **Add think time** in scenarios (between iterations)
- **Validate responses** in Operations layer
- **Follow PostsOperations.js** as a reference

### ❌ Don't

- **Don't parse JSON multiple times** - It's expensive and unnecessary
- **Don't add sleep() in operations** - Use scenario-level think time
- **Don't skip BaseOperations** - Breaks consistency
- **Don't duplicate validation** - Keep it in Operations layer only

---

## Authentication Patterns

The framework supports multiple authentication patterns through BaseOperations:

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
  Authorization: `Bearer ${config.apiKey}`,
  "Content-Type": "application/json",
};
```

### Basic Auth

```javascript
import encoding from "k6/encoding";

const credentials = encoding.b64encode(`${username}:${password}`);
this.baseHeaders = {
  Authorization: `Basic ${credentials}`,
  "Content-Type": "application/json",
};
```

See `src/operations/BaseOperations.js` for more authentication patterns.

---

## Troubleshooting

### Tests Not Running

```bash
# Check k6 is installed
k6 version

# Should output something like: k6 v0.48.0

# Run quick test to validate
npm run test:quick
```

### "Cannot find module" Errors

- Verify file paths in import statements
- Check that all files exist in the correct locations
- Ensure you're running k6 from the project root

### High Failure Rate

- **Check API availability**: Is the endpoint reachable?
- **Review thresholds**: Are they realistic for your API?
- **Check VU count**: Too many concurrent users?
- **Network issues**: Firewall or connectivity problems?

### "Cannot create results directory"

```bash
# Create directories manually
mkdir -p results/html
mkdir -p results/json
```

---

## Understanding Results

### Key Metrics Explained

**http_req_duration**: Time for complete HTTP request/response

- Look at p(95) and p(99) percentiles
- Lower is better

**http_req_failed**: Percentage of failed requests

- Should be close to 0%
- Higher means reliability issues

**checks**: Percentage of validation checks that passed

- Should be close to 100%
- Lower means response validation failures

**vus**: Number of virtual users running

- Should match your scenario configuration

### Example Good Results

```
✓ http_req_duration..............: avg=125ms  min=98ms  max=245ms  p(95)=198ms
✓ http_req_failed................: 0.00%
✓ checks.........................: 100.00%
  http_reqs......................: 1500
  vus............................: 5
```

---

## Development

### Requirements

- **k6** v0.40.0 or higher ([download](https://k6.io/docs/getting-started/installation/))
- **Node.js** 16+ (for linting and formatting tools)

### Setup

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format

# Validate everything
npm run validate
```

---

## Contributing

We welcome contributions! To contribute:

1. **Follow the 3-layer architecture**
2. **Extend BaseOperations** for new API resources
3. **Add tests** for new features
4. **Update documentation** if needed
5. **Run validation** before committing: `npm run validate`
6. **Submit a pull request** with clear description

---

## License

ISC

---

## Support

- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture
- **k6 Docs**: [k6.io/docs](https://k6.io/docs/)
- **Issues**: [GitHub Issues](https://github.com/incubyte/k6-api-performance-framework/issues)

---

## Framework Status

**Version**: 3.0
**Status**: Production-ready
**Score**: 4.5/5
**Use As**: Template for your k6 performance testing projects
**Last Updated**: January 2026

---

Built with ❤️ for the performance testing community.
