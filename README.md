# K6 API Performance Framework

A simplified, extensible k6 performance testing framework with a clean 3-layer architecture. **Perfect as a template for your own performance testing projects.**

---

## Quick Start

```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io/docs/getting-started/installation/

# Run quick validation test (1 iteration, ~3 seconds)
k6 run scenarios/quick-test.js

# Run smoke test (1 VU, 1 minute)
k6 run scenarios/smoke-test.js

# Run load test (5 VUs, 5 minutes)
k6 run scenarios/load-test.js
```

---

## Architecture Overview

This framework uses a **simplified 3-layer architecture** designed for clarity, maintainability, and easy extensibility:

```
Scenarios → User Journeys → Operations → HTTP Utils
   ↓            ↓               ↓            ↓
Config     Orchestration   HTTP+Validate   k6/http
```

### Layer Responsibilities

1. **Scenarios** (`scenarios/*.js`): Test configuration (VUs, duration, thresholds)
2. **User Journeys** (`src/user-journeys/*.js`): Business workflow orchestration
3. **Operations** (`src/operations/*.js`): HTTP request execution + validation (single source of truth)
4. **Utils** (`src/lib/*.js`): HTTP wrappers & helpers

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Test Types

| Test Type | Purpose | Configuration |
|-----------|---------|---------------|
| **Quick** | Fast validation | 1 VU, 1 iteration (~3s) |
| **Smoke** | Basic functionality | 1 VU, 1 minute |
| **Load** | Sustained performance | 5 VUs, 5 minutes |
| **Stress** | Breaking point | Ramp up to 20 VUs |
| **Soak** | Long-duration stability | 3 VUs, 15 minutes |

---

## Project Structure

```
k6-api-performance-framework/
├── scenarios/              # Test scenarios (smoke, load, stress, etc.)
│   ├── quick-test.js
│   ├── smoke-test.js
│   ├── load-test.js
│   ├── stress-test.js
│   └── soak-test.js
├── src/
│   ├── user-journeys/      # Business workflow orchestration
│   │   └── posts-test.js
│   ├── operations/         # API operations (HTTP + validation)
│   │   ├── BaseOperations.js     # Base class with shared config
│   │   └── PostsOperations.js    # Posts API operations
│   ├── lib/                # Utilities
│   │   ├── request-utils.js
│   │   └── utils.js
│   └── payloads/           # Test data
│       └── posts-payload.js
├── config.js               # Base configuration
├── endpoints.js            # API endpoints
├── ARCHITECTURE.md         # Detailed architecture docs
└── FRAMEWORK_ANALYSIS.md   # Performance & architecture analysis
```

---

## Adding a New API Resource

This framework is designed as a **template** for your projects. Here's how to extend it with new resources (Users, Comments, Albums, etc.):

### Example: Adding a Users API Resource

#### Step 1: Add Endpoints (`endpoints.js`)
```javascript
export const endpoints = {
  posts: `${BASE_URL}/posts`,
  users: `${BASE_URL}/users`,           // NEW
  user: (id) => `${BASE_URL}/users/${id}`,  // NEW
};
```

#### Step 2: Create Operations Class (`src/operations/UsersOperations.js`)
```javascript
import { group, check } from "k6";
import { endpoints } from "../../endpoints.js";
import * as requestUtils from "../lib/request-utils.js";
import { logError } from "../lib/utils.js";
import BaseOperations from "./BaseOperations.js";  // Extend base class

export default class UsersOperations extends BaseOperations {
    constructor() {
        super();  // Inherits baseHeaders
    }

    getAllUsers() {
        return group("Get All Users", () => {
            // Build and execute request
            const url = endpoints.users;
            const headers = requestUtils.buildHeaders({ base: this.baseHeaders });
            const response = requestUtils.performGet(
                url, headers, {},
                "Successfully retrieved all users",
                "Get All Users"
            );

            // Validate response
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
                url, headers, {},
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

#### Step 3: Create User Journey (`src/user-journeys/users-test.js`)
```javascript
import UsersOperations from "../operations/UsersOperations.js";

export default function usersTest() {
    const operations = new UsersOperations();

    // Execute user operations
    operations.getAllUsers();
    operations.getUser(1);
}
```

#### Step 4: Use in Scenario
```javascript
import usersTest from "../src/user-journeys/users-test.js";

export default function () {
    usersTest();
}
```

### Key Benefits of BaseOperations

- ✅ **Shared Configuration**: All operations inherit `baseHeaders` from `BaseOperations`
- ✅ **Consistent Pattern**: Follow `PostsOperations.js` as a reference
- ✅ **Easy to Extend**: Just create new class extending `BaseOperations`
- ✅ **Maintainable**: Update API key in one place (BaseOperations)

See `src/operations/BaseOperations.js` for detailed extension documentation.

---

## Configuration

### Base URL
Edit `endpoints.js`:
```javascript
const BASE_URL = "https://jsonplaceholder.typicode.com";  // Change here
```

### Test Thresholds
Edit scenario files (e.g., `scenarios/load-test.js`):
```javascript
thresholds: {
  http_req_duration: ["p(95)<500"],  // 95% requests < 500ms
  http_req_failed: ["rate<0.01"],    // < 1% failures
}
```

---

## Running Tests

### Basic Execution
```bash
# Run specific scenario
k6 run scenarios/smoke-test.js

# Run with custom VUs and duration
k6 run --vus 10 --duration 30s scenarios/load-test.js

# Run with detailed metrics
k6 run --summary-trend-stats="avg,min,med,max,p(95),p(99)" scenarios/load-test.js
```

### Viewing Results
```bash
# HTML reports are generated in results/html/
open results/html/smoketest.html  # macOS
xdg-open results/html/smoketest.html  # Linux
```

---

## Best Practices

### ✅ Do
- Extend `BaseOperations` for new API resources (consistent pattern)
- Cache JSON parsing results (`const data = response.json()`)
- Validate in Operations layer (single source of truth)
- Use k6 `group()` to organize metrics by operation
- Add think time between iterations in scenarios
- Follow `PostsOperations.js` as a reference when adding new resources

### ❌ Don't
- Don't parse JSON multiple times per request
- Don't add `sleep()` inside operations (use scenario-level think time)
- Don't skip extending BaseOperations (maintains consistency)
- Don't duplicate validation logic across operations

---

## Performance Optimizations

This framework includes several optimizations:

1. **JSON Parsing**: Cached per request (+1.34% throughput)
2. **Layer Reduction**: 6 layers → 3 layers (50% complexity reduction)
3. **Dead Code Removal**: 270+ lines of unused code removed
4. **Single Validation**: Removed redundant checks (2x → 1x validation)
5. **Simplified Architecture**: Merged handlers + steps → operations

See [FRAMEWORK_ANALYSIS.md](./FRAMEWORK_ANALYSIS.md) for detailed performance analysis.

---

## Troubleshooting

### Tests Failing
```bash
# Check k6 version
k6 version

# Run quick test for fast validation
k6 run scenarios/quick-test.js

# Check detailed logs
k6 run scenarios/smoke-test.js --verbose
```

### Common Issues

**"Unknown dependency" error**
- Verify k6 is installed correctly
- Check import paths are correct

**"HTTP request failed" errors**
- Verify API endpoint is accessible
- Check network connectivity
- Review `endpoints.js` configuration

**High failure rate**
- Check thresholds are realistic
- Verify API performance
- Review VU count and duration

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed architecture documentation with examples
- **[FRAMEWORK_ANALYSIS.md](./FRAMEWORK_ANALYSIS.md)**: Performance and architecture analysis (3,300+ lines)
- **[k6 Documentation](https://k6.io/docs/)**: Official k6 docs

---

## Development

### Requirements
- k6 v0.40.0+ (latest recommended)
- Node.js (for eslint/prettier)

### Code Quality
```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run all tests
npm run test:smoke
```

---

## Contributing

1. Follow the established 3-layer architecture
2. Extend `BaseOperations` for new API resources
3. Add tests for new features
4. Update documentation (ARCHITECTURE.md if architecture changes)
5. Ensure all tests pass before committing

---

## License

[Add your license here]

---

## Contact

[Add your contact information here]

---

**Framework Status**: Template-ready, extensible 3-layer architecture (v3.0)
**Last Updated**: January 14, 2026
**Use As**: Clone this repo as a template for your k6 performance testing projects
