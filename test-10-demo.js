const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DemoTest {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.totalRequests = 10; // Demo with 10 requests
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  getRandomTopic() {
    const topics = [
      'quadratic equations',
      'linear functions',
      'trigonometry',
      'statistics',
      'geometry',
      'algebra',
      'calculus',
      'probability',
      'matrices',
      'vectors'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  getRandomDifficulty() {
    const difficulties = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  getRandomType() {
    const types = ['essay', 'multiple choice', 'short answer'];
    return types[Math.floor(Math.random() * types.length)];
  }

  async testRequest(requestNumber) {
    const startTime = Date.now();
    const testData = {
      prompt: `Create a mathematics question about ${this.getRandomTopic()}`,
      mode: "detail",
      difficulty: this.getRandomDifficulty(),
      type: this.getRandomType(),
      lang: "en"
    };

    try {
      const curlCommand = `curl -s -X POST ${this.baseURL}/api/generate \
        -H "Content-Type: application/json" \
        -d '${JSON.stringify(testData)}' \
        -w "HTTP_STATUS:%{http_code},TIME:%{time_total}" \
        --max-time 60`;

      const { stdout } = await execAsync(curlCommand);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Parse curl output
      const lines = stdout.split('\n');
      const lastLine = lines[lines.length - 1];
      const statusMatch = lastLine.match(/HTTP_STATUS:(\d+)/);
      const timeMatch = lastLine.match(/TIME:([\d.]+)/);
      
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 0;
      const curlTime = timeMatch ? parseFloat(timeMatch[1]) * 1000 : 0; // Convert to ms
      
      // Check if response contains result
      const hasResult = stdout.includes('"result"') && !stdout.includes('"error"');
      
      return {
        requestNumber,
        success: statusCode === 200 && hasResult,
        responseTime: curlTime || responseTime,
        statusCode,
        hasResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        requestNumber,
        success: false,
        responseTime,
        statusCode: 'NETWORK_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runTest() {
    console.log('🚀 DEMO TESTING 10 REQUESTS TO API GENERATE');
    console.log('=' .repeat(60));
    console.log(`📊 Target: ${this.totalRequests} requests to /api/generate`);
    console.log(`🎯 Mode: detail (single question generation)`);
    console.log(`🌐 Base URL: ${this.baseURL}`);
    console.log('=' .repeat(60));
    console.log('');

    this.startTime = Date.now();
    console.log(`⏰ Test started at: ${new Date().toLocaleString()}`);
    console.log('');

    console.log('🔄 Executing 10 requests...');
    console.log('⏳ This will take about 1-2 minutes...');
    console.log('');

    // Execute requests sequentially
    for (let i = 1; i <= this.totalRequests; i++) {
      console.log(`📤 Request ${i}/${this.totalRequests} - Sending...`);
      const result = await this.testRequest(i);
      this.results.push(result);
      
      const status = result.success ? '✅' : '❌';
      const time = (result.responseTime / 1000).toFixed(2);
      console.log(`${status} Request ${i} completed in ${time}s | Status: ${result.statusCode}`);
      
      // Small delay between requests
      if (i < this.totalRequests) {
        console.log('⏳ Waiting 2 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    this.endTime = Date.now();

    console.log('✅ All requests completed!');
    console.log(`⏰ Test ended at: ${new Date().toLocaleString()}`);
    console.log('');

    this.generateReport();
  }

  generateReport() {
    const totalTime = this.endTime - this.startTime;
    const successfulRequests = this.results.filter(r => r.success);
    const failedRequests = this.results.filter(r => !r.success);
    
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    const successRate = (successfulRequests.length / this.totalRequests) * 100;
    const requestsPerSecond = (this.totalRequests / (totalTime / 1000)).toFixed(2);

    // MAIN SUMMARY
    console.log('📈 TEST RESULTS SUMMARY (10 REQUESTS DEMO)');
    console.log('=' .repeat(60));
    console.log(`⏱️  TOTAL TEST TIME: ${(totalTime / 1000).toFixed(2)} SECONDS`);
    console.log(`📊 TOTAL REQUESTS: ${this.totalRequests}`);
    console.log(`✅ SUCCESSFUL REQUESTS: ${successfulRequests.length}`);
    console.log(`❌ FAILED REQUESTS: ${failedRequests.length}`);
    console.log(`📈 SUCCESS RATE: ${successRate.toFixed(2)}%`);
    console.log(`🚀 REQUESTS PER SECOND: ${requestsPerSecond}`);
    console.log('');

    // RESPONSE TIME STATISTICS
    console.log('⏱️  RESPONSE TIME STATISTICS');
    console.log('=' .repeat(60));
    console.log(`📊 Average: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`⚡ Fastest: ${minResponseTime}ms`);
    console.log(`🐌 Slowest: ${maxResponseTime}ms`);
    console.log('');

    // TIME ANALYSIS
    console.log('⏰ TIME ANALYSIS');
    console.log('=' .repeat(60));
    const totalSeconds = totalTime / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    console.log(`🕐 Total time: ${minutes} minutes ${seconds.toFixed(2)} seconds`);
    console.log(`⚡ Average per request: ${(totalSeconds / this.totalRequests).toFixed(2)} seconds`);
    console.log(`🚀 Throughput: ${requestsPerSecond} requests/second`);
    console.log('');

    // ESTIMATION FOR 100 REQUESTS
    console.log('🔮 ESTIMATION FOR 100 REQUESTS');
    console.log('=' .repeat(60));
    const estimatedTimeFor100 = (avgResponseTime / 1000) * 100; // seconds
    const estimatedMinutes = Math.floor(estimatedTimeFor100 / 60);
    const estimatedSeconds = estimatedTimeFor100 % 60;
    
    console.log(`📊 Based on average response time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`⏱️  Estimated time for 100 requests: ${estimatedMinutes} minutes ${estimatedSeconds.toFixed(0)} seconds`);
    console.log(`🚀 Estimated throughput: ${(100 / estimatedTimeFor100).toFixed(2)} requests/second`);
    console.log('');

    // DETAILED RESULTS
    console.log('📋 DETAILED RESULTS (All Requests)');
    console.log('=' .repeat(60));
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      const seconds = (result.responseTime / 1000).toFixed(2);
      console.log(`${status} Request ${result.requestNumber.toString().padStart(2)}: ${time.padStart(8)} (${seconds}s) | Status: ${result.statusCode}`);
    });
    console.log('');

    // PERFORMANCE ASSESSMENT
    console.log('🎯 PERFORMANCE ASSESSMENT');
    console.log('=' .repeat(60));
    
    // Success rate assessment
    if (successRate >= 95) {
      console.log('✅ EXCELLENT: Success rate above 95%');
    } else if (successRate >= 90) {
      console.log('🟡 GOOD: Success rate above 90%');
    } else if (successRate >= 80) {
      console.log('🟠 FAIR: Success rate above 80%');
    } else {
      console.log('🔴 POOR: Success rate below 80%');
    }

    // Response time assessment
    if (avgResponseTime < 2000) {
      console.log('✅ EXCELLENT: Average response time under 2 seconds');
    } else if (avgResponseTime < 5000) {
      console.log('🟡 GOOD: Average response time under 5 seconds');
    } else if (avgResponseTime < 10000) {
      console.log('🟠 FAIR: Average response time under 10 seconds');
    } else {
      console.log('🔴 POOR: Average response time over 10 seconds');
    }

    // Throughput assessment
    if (requestsPerSecond >= 10) {
      console.log('✅ EXCELLENT: High throughput (>10 req/sec)');
    } else if (requestsPerSecond >= 5) {
      console.log('🟡 GOOD: Medium throughput (5-10 req/sec)');
    } else if (requestsPerSecond >= 2) {
      console.log('🟠 FAIR: Low throughput (2-5 req/sec)');
    } else {
      console.log('🔴 POOR: Very low throughput (<2 req/sec)');
    }
    console.log('');

    // RECOMMENDATIONS
    console.log('💡 RECOMMENDATIONS');
    console.log('=' .repeat(60));
    if (successRate < 95) {
      console.log('🔧 Consider implementing retry logic for failed requests');
    }
    if (avgResponseTime > 5000) {
      console.log('⚡ Consider optimizing API response time or implementing caching');
    }
    if (requestsPerSecond < 5) {
      console.log('🚀 Consider implementing request batching or parallel processing');
    }
    console.log('');

    // FINAL SUMMARY
    console.log('🏁 FINAL SUMMARY');
    console.log('=' .repeat(60));
    console.log(`📊 Total ${this.totalRequests} requests completed in ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`✅ ${successfulRequests.length} requests successful (${successRate.toFixed(1)}%)`);
    console.log(`⚡ Average response time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`🚀 Throughput: ${requestsPerSecond} requests/second`);
    console.log('');
    console.log('💡 For complete 100 request test, use: npm run test:100:simple');
    console.log('🎉 Demo test completed!');
  }
}

// Check if server is running before starting test
async function checkServer() {
  try {
    const { stdout } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:8000');
    return stdout.trim() === '200';
  } catch (error) {
    return false;
  }
}

// Main execution
async function runTest() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:8000');
    console.log('💡 Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running! Starting demo test...\n');
  
  const test = new DemoTest();
  await test.runTest();
}

runTest().catch(console.error); 