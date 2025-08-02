const fetch = require('node-fetch');

class APIPerformanceTest {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalRequests = 100;
  }

  async testRequest(requestNumber) {
    const startTime = Date.now();
    const testData = {
      prompt: `Buat soal matematika tentang ${this.getRandomTopic()}`,
      mode: "detail",
      difficulty: this.getRandomDifficulty(),
      type: this.getRandomType(),
      lang: "id"
    };

    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const responseData = await response.json();

      if (response.ok && responseData.result) {
        this.successCount++;
        return {
          requestNumber,
          success: true,
          responseTime,
          statusCode: response.status,
          hasResult: !!responseData.result,
          resultLength: responseData.result.length,
          timestamp: new Date().toISOString()
        };
      } else {
        this.errorCount++;
        return {
          requestNumber,
          success: false,
          responseTime,
          statusCode: response.status,
          error: responseData.error || 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      this.errorCount++;
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

  getRandomTopic() {
    const topics = [
      'persamaan kuadrat',
      'fungsi linear',
      'trigonometri',
      'statistika',
      'geometri',
      'aljabar',
      'kalkulus',
      'probabilitas',
      'matriks',
      'vektor'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  getRandomDifficulty() {
    const difficulties = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  getRandomType() {
    const types = ['essay', 'pilihan ganda', 'isian singkat'];
    return types[Math.floor(Math.random() * types.length)];
  }

  async runTest() {
    console.log('🚀 Starting API Performance Test');
    console.log('=' .repeat(60));
    console.log(`📊 Total Requests: ${this.totalRequests}`);
    console.log(`🎯 Target: /api/generate (detail mode)`);
    console.log(`🌐 Base URL: ${this.baseURL}`);
    console.log('=' .repeat(60));
    console.log('');

    this.startTime = Date.now();

    // Create array of promises for concurrent requests
    const promises = [];
    for (let i = 1; i <= this.totalRequests; i++) {
      promises.push(this.testRequest(i));
    }

    // Execute all requests concurrently
    this.results = await Promise.all(promises);
    this.endTime = Date.now();

    this.generateReport();
  }

  generateReport() {
    const totalTime = this.endTime - this.startTime;
    const successfulRequests = this.results.filter(r => r.success);
    const failedRequests = this.results.filter(r => !r.success);
    
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    
    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const medianResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length / 2)] : 0;
    
    const p95ResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] : 0;
    const p99ResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] : 0;

    const successRate = (this.successCount / this.totalRequests) * 100;
    const requestsPerSecond = (this.totalRequests / (totalTime / 1000)).toFixed(2);

    console.log('📈 PERFORMANCE TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total Test Duration: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`📊 Total Requests: ${this.totalRequests}`);
    console.log(`✅ Successful Requests: ${this.successCount}`);
    console.log(`❌ Failed Requests: ${this.errorCount}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`🚀 Requests/Second: ${requestsPerSecond}`);
    console.log('');
    
    console.log('⏱️  RESPONSE TIME STATISTICS (ms)');
    console.log('=' .repeat(60));
    console.log(`📊 Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`⚡ Minimum Response Time: ${minResponseTime}ms`);
    console.log(`🐌 Maximum Response Time: ${maxResponseTime}ms`);
    console.log(`📏 Median Response Time: ${medianResponseTime}ms`);
    console.log(`📊 95th Percentile: ${p95ResponseTime}ms`);
    console.log(`📊 99th Percentile: ${p99ResponseTime}ms`);
    console.log('');

    if (failedRequests.length > 0) {
      console.log('❌ FAILED REQUESTS ANALYSIS');
      console.log('=' .repeat(60));
      const errorSummary = {};
      failedRequests.forEach(req => {
        const errorType = req.statusCode === 'NETWORK_ERROR' ? 'Network Error' : 
                         req.statusCode >= 500 ? 'Server Error' : 
                         req.statusCode >= 400 ? 'Client Error' : 'Other Error';
        errorSummary[errorType] = (errorSummary[errorType] || 0) + 1;
      });
      
      Object.entries(errorSummary).forEach(([errorType, count]) => {
        console.log(`🔴 ${errorType}: ${count} requests`);
      });
      console.log('');
    }

    console.log('📊 RESPONSE TIME DISTRIBUTION');
    console.log('=' .repeat(60));
    const timeRanges = [
      { min: 0, max: 1000, label: '0-1s' },
      { min: 1000, max: 2000, label: '1-2s' },
      { min: 2000, max: 5000, label: '2-5s' },
      { min: 5000, max: 10000, label: '5-10s' },
      { min: 10000, max: Infinity, label: '10s+' }
    ];

    timeRanges.forEach(range => {
      const count = responseTimes.filter(time => 
        time >= range.min && time < range.max
      ).length;
      const percentage = (count / responseTimes.length * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 5));
      console.log(`${range.label.padEnd(8)}: ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
    });
    console.log('');

    console.log('🎯 PERFORMANCE ASSESSMENT');
    console.log('=' .repeat(60));
    if (successRate >= 95) {
      console.log('✅ Excellent: Success rate above 95%');
    } else if (successRate >= 90) {
      console.log('🟡 Good: Success rate above 90%');
    } else if (successRate >= 80) {
      console.log('🟠 Fair: Success rate above 80%');
    } else {
      console.log('🔴 Poor: Success rate below 80%');
    }

    if (avgResponseTime < 2000) {
      console.log('✅ Excellent: Average response time under 2 seconds');
    } else if (avgResponseTime < 5000) {
      console.log('🟡 Good: Average response time under 5 seconds');
    } else if (avgResponseTime < 10000) {
      console.log('🟠 Fair: Average response time under 10 seconds');
    } else {
      console.log('🔴 Poor: Average response time over 10 seconds');
    }

    console.log('');
    console.log('💡 RECOMMENDATIONS');
    console.log('=' .repeat(60));
    if (successRate < 95) {
      console.log('🔧 Consider implementing retry logic for failed requests');
    }
    if (avgResponseTime > 5000) {
      console.log('⚡ Consider optimizing API response time or implementing caching');
    }
    if (p95ResponseTime > 10000) {
      console.log('📊 High 95th percentile suggests inconsistent performance - investigate outliers');
    }
    if (requestsPerSecond < 10) {
      console.log('🚀 Consider implementing request batching or parallel processing');
    }
    console.log('');

    console.log('📋 DETAILED RESULTS (First 10 requests)');
    console.log('=' .repeat(60));
    this.results.slice(0, 10).forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      console.log(`${status} Request ${result.requestNumber.toString().padStart(3)}: ${time.padStart(8)} | Status: ${result.statusCode}`);
    });
    
    if (this.results.length > 10) {
      console.log(`... and ${this.results.length - 10} more requests`);
    }
    console.log('');
    console.log('🏁 Test completed!');
  }
}

// Run the test
async function main() {
  const test = new APIPerformanceTest();
  await test.runTest();
}

// Check if server is running before starting test
async function checkServer() {
  try {
    const response = await fetch('http://localhost:8000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test', mode: 'detail', lang: 'id' })
    });
    return true;
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
  
  console.log('✅ Server is running! Starting performance test...\n');
  await main();
}

runTest().catch(console.error); 