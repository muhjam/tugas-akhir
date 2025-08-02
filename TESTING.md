# API Performance Testing Documentation

## Overview
This project includes comprehensive automation tests for the API generate detail question endpoint. The tests are designed to measure performance, reliability, and response times under various load conditions.

## Test Scripts

### 1. Basic Performance Test (`test-api-performance.js`)
**Command:** `npm run test:api`

A comprehensive test that sends 100 concurrent requests to the `/api/generate` endpoint and provides detailed performance metrics.

**Features:**
- 100 concurrent requests
- Detailed response time statistics
- Success/failure analysis
- Performance recommendations
- Response time distribution charts

### 2. Advanced Performance Test (`test-api-advanced.js`)
**Command:** `npm run test:api:advanced`

An advanced test suite that runs three different test patterns:
- **Concurrent**: 100 requests simultaneously
- **Sequential**: 100 requests one by one
- **Burst**: 10 requests at a time with delays

**Features:**
- Multiple test patterns for comprehensive analysis
- Detailed comparison between different approaches
- Memory usage tracking
- Optimal configuration suggestions
- Performance recommendations based on test results

### 3. Focused 100 Request Test (`test-100-requests.js`)
**Command:** `npm run test:100`

A focused test specifically designed for testing exactly 100 requests with detailed timing information.

**Features:**
- Exactly 100 concurrent requests
- Detailed timing analysis
- Comprehensive performance assessment
- Clear recommendations
- Detailed results for first 20 requests

### 4. Simple 100 Request Test (`test-100-simple.js`)
**Command:** `npm run test:100:simple`

A simple test using curl commands to test 100 requests sequentially.

**Features:**
- 100 sequential requests using curl
- Detailed performance metrics
- Progress tracking
- Comprehensive reporting

### 5. Demo Test (`test-10-demo.js`)
**Command:** `npm run test:demo`

A quick demo test with 10 requests to demonstrate the testing functionality.

**Features:**
- 10 requests for quick testing
- Real-time progress display
- Estimation for 100 requests
- Performance assessment

## Prerequisites

1. **Server Running**: Make sure your Next.js server is running on port 8000
   ```bash
   npm run dev
   ```

2. **Dependencies**: The test scripts require `node-fetch` which is already installed as a dev dependency.

## Running the Tests

### Quick Start (Recommended)
```bash
# Start the server first
npm run dev

# In another terminal, run the demo test
npm run test:demo
```

### All Test Options
```bash
# Demo test (10 requests)
npm run test:demo

# Basic performance test
npm run test:api

# Advanced test suite (3 different patterns)
npm run test:api:advanced

# Focused 100 request test
npm run test:100

# Simple 100 request test (recommended)
npm run test:100:simple
```

## Test Data

Each test uses randomized data to simulate real-world usage:

**Topics:** quadratic equations, linear functions, trigonometry, statistics, geometry, algebra, calculus, probability, matrices, vectors

**Difficulties:** c1, c2, c3, c4, c5, c6

**Types:** essay, multiple choice, short answer

**Language:** English (en)

## Expected Output

The tests provide comprehensive output including:

### Performance Metrics
- Total test duration
- Success rate percentage
- Average response time
- Minimum and maximum response times
- 95th and 99th percentiles
- Requests per second (throughput)

### Analysis
- Response time distribution
- Error analysis (if any)
- Performance assessment (Excellent/Good/Fair/Poor)
- Specific recommendations for improvement

### Sample Output Structure
```
🚀 DEMO TESTING 10 REQUESTS TO API GENERATE
============================================================
📊 Target: 10 requests to /api/generate
🎯 Mode: detail (single question generation)
🌐 Base URL: http://localhost:8000
============================================================

📈 TEST RESULTS SUMMARY (10 REQUESTS DEMO)
============================================================
⏱️  TOTAL TEST TIME: 61.83 SECONDS
📊 TOTAL REQUESTS: 10
✅ SUCCESSFUL REQUESTS: 10
❌ FAILED REQUESTS: 0
📈 SUCCESS RATE: 100.00%
🚀 REQUESTS PER SECOND: 0.16

⏱️  RESPONSE TIME STATISTICS
============================================================
📊 Average: 4341.24ms
⚡ Fastest: 1715.794ms
🐌 Slowest: 9341.67ms

🔮 ESTIMATION FOR 100 REQUESTS
============================================================
📊 Based on average response time: 4341ms
⏱️  Estimated time for 100 requests: 7 minutes 14 seconds
🚀 Estimated throughput: 0.23 requests/second
```

## Performance Benchmarks

### Excellent Performance
- Success Rate: ≥95%
- Average Response Time: <2 seconds
- Throughput: ≥10 requests/second

### Good Performance
- Success Rate: ≥90%
- Average Response Time: <5 seconds
- Throughput: ≥5 requests/second

### Fair Performance
- Success Rate: ≥80%
- Average Response Time: <10 seconds
- Throughput: ≥2 requests/second

### Poor Performance
- Success Rate: <80%
- Average Response Time: ≥10 seconds
- Throughput: <2 requests/second

## Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   ❌ Server is not running on http://localhost:8000
   💡 Please start the server with: npm run dev
   ```
   **Solution:** Start the server with `npm run dev`

2. **Network Errors**
   - Check if the server is accessible
   - Verify port 8000 is not blocked
   - Check firewall settings

3. **High Response Times**
   - Check Azure OpenAI service status
   - Verify API keys and endpoints
   - Consider implementing caching

4. **High Failure Rate**
   - Check server logs for errors
   - Verify API rate limits
   - Check Azure OpenAI quota

## Recommendations

### For High Load Scenarios
- Implement request queuing
- Add retry logic with exponential backoff
- Consider implementing caching
- Monitor Azure OpenAI rate limits

### For Production Use
- Set up monitoring and alerting
- Implement circuit breaker pattern
- Add request timeout handling
- Consider load balancing

## File Structure

```
├── test-api-performance.js      # Basic performance test
├── test-api-advanced.js         # Advanced test suite
├── test-100-requests.js         # Focused 100 request test
├── test-100-simple.js           # Simple 100 request test
├── test-10-demo.js              # Demo test (10 requests)
├── TESTING.md                   # This documentation
└── package.json                 # Script definitions
```

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Include comprehensive error handling
3. Provide detailed output and analysis
4. Add appropriate documentation
5. Update this README with new test information 