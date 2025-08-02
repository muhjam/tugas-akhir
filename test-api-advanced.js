const fetch = require('node-fetch');

class AdvancedAPIPerformanceTest {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.results = {
      concurrent: [],
      sequential: [],
      burst: []
    };
    this.startTime = null;
    this.endTime = null;
    this.totalRequests = 100;
    this.burstSize = 10;
    this.delayBetweenBursts = 1000; // 1 second
  }

  async testRequest(requestNumber, testType = 'concurrent') {
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
        return {
          requestNumber,
          testType,
          success: true,
          responseTime,
          statusCode: response.status,
          hasResult: !!responseData.result,
          resultLength: responseData.result.length,
          timestamp: new Date().toISOString(),
          memoryUsage: process.memoryUsage()
        };
      } else {
        return {
          requestNumber,
          testType,
          success: false,
          responseTime,
          statusCode: response.status,
          error: responseData.error || 'Unknown error',
          timestamp: new Date().toISOString(),
          memoryUsage: process.memoryUsage()
        };
      }
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      return {
        requestNumber,
        testType,
        success: false,
        responseTime,
        statusCode: 'NETWORK_ERROR',
        error: error.message,
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage()
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

  async runConcurrentTest() {
    console.log('🚀 Running CONCURRENT Test (100 requests simultaneously)');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 1; i <= this.totalRequests; i++) {
      promises.push(this.testRequest(i, 'concurrent'));
    }

    this.results.concurrent = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`✅ Concurrent test completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds\n`);
    return { startTime, endTime };
  }

  async runSequentialTest() {
    console.log('📝 Running SEQUENTIAL Test (100 requests one by one)');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    this.results.sequential = [];
    
    for (let i = 1; i <= this.totalRequests; i++) {
      const result = await this.testRequest(i, 'sequential');
      this.results.sequential.push(result);
      
      // Progress indicator
      if (i % 10 === 0) {
        process.stdout.write(`\r📊 Progress: ${i}/${this.totalRequests} (${((i/this.totalRequests)*100).toFixed(1)}%)`);
      }
    }
    
    const endTime = Date.now();
    console.log(`\n✅ Sequential test completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds\n`);
    return { startTime, endTime };
  }

  async runBurstTest() {
    console.log('💥 Running BURST Test (10 requests at a time, with delays)');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    this.results.burst = [];
    const totalBursts = Math.ceil(this.totalRequests / this.burstSize);
    
    for (let burst = 0; burst < totalBursts; burst++) {
      const burstStart = burst * this.burstSize + 1;
      const burstEnd = Math.min((burst + 1) * this.burstSize, this.totalRequests);
      
      console.log(`💥 Burst ${burst + 1}/${totalBursts}: Requests ${burstStart}-${burstEnd}`);
      
      const promises = [];
      for (let i = burstStart; i <= burstEnd; i++) {
        promises.push(this.testRequest(i, 'burst'));
      }
      
      const burstResults = await Promise.all(promises);
      this.results.burst.push(...burstResults);
      
      // Delay between bursts (except for the last burst)
      if (burst < totalBursts - 1) {
        console.log(`⏳ Waiting ${this.delayBetweenBursts}ms before next burst...`);
        await new Promise(resolve => setTimeout(resolve, this.delayBetweenBursts));
      }
    }
    
    const endTime = Date.now();
    console.log(`✅ Burst test completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds\n`);
    return { startTime, endTime };
  }

  calculateStats(results) {
    const successfulRequests = results.filter(r => r.success);
    const failedRequests = results.filter(r => !r.success);
    
    const responseTimes = successfulRequests.map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0 ? 
      responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;
    
    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const medianResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length / 2)] : 0;
    
    const p95ResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] : 0;
    const p99ResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] : 0;

    const successRate = (successfulRequests.length / results.length) * 100;
    
    return {
      totalRequests: results.length,
      successfulRequests: successfulRequests.length,
      failedRequests: failedRequests.length,
      successRate,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      medianResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      responseTimes
    };
  }

  async runAllTests() {
    console.log('🧪 ADVANCED API PERFORMANCE TEST SUITE');
    console.log('=' .repeat(60));
    console.log(`📊 Total Requests per test: ${this.totalRequests}`);
    console.log(`🎯 Target: /api/generate (detail mode)`);
    console.log(`🌐 Base URL: ${this.baseURL}`);
    console.log('=' .repeat(60));
    console.log('');

    this.startTime = Date.now();

    // Run all test types
    const concurrentTime = await this.runConcurrentTest();
    const sequentialTime = await this.runSequentialTest();
    const burstTime = await this.runBurstTest();

    this.endTime = Date.now();
    
    this.generateComprehensiveReport({
      concurrent: concurrentTime,
      sequential: sequentialTime,
      burst: burstTime
    });
  }

  generateComprehensiveReport(testTimes) {
    const totalTime = this.endTime - this.startTime;
    
    console.log('📈 COMPREHENSIVE PERFORMANCE TEST RESULTS');
    console.log('=' .repeat(80));
    console.log(`⏱️  Total Test Suite Duration: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log('');

    // Calculate stats for each test type
    const concurrentStats = this.calculateStats(this.results.concurrent);
    const sequentialStats = this.calculateStats(this.results.sequential);
    const burstStats = this.calculateStats(this.results.burst);

    // Test comparison table
    console.log('📊 TEST COMPARISON SUMMARY');
    console.log('=' .repeat(80));
    console.log('Test Type      | Duration | Success Rate | Avg Time | Min Time | Max Time | RPS');
    console.log('---------------|----------|--------------|----------|----------|----------|-----');
    
    const concurrentDuration = (testTimes.concurrent.endTime - testTimes.concurrent.startTime) / 1000;
    const sequentialDuration = (testTimes.sequential.endTime - testTimes.sequential.startTime) / 1000;
    const burstDuration = (testTimes.burst.endTime - testTimes.burst.startTime) / 1000;
    
    console.log(`Concurrent     | ${concurrentDuration.toFixed(2)}s    | ${concurrentStats.successRate.toFixed(1)}%      | ${concurrentStats.avgResponseTime.toFixed(0)}ms   | ${concurrentStats.minResponseTime}ms   | ${concurrentStats.maxResponseTime}ms   | ${(this.totalRequests/concurrentDuration).toFixed(1)}`);
    console.log(`Sequential     | ${sequentialDuration.toFixed(2)}s    | ${sequentialStats.successRate.toFixed(1)}%      | ${sequentialStats.avgResponseTime.toFixed(0)}ms   | ${sequentialStats.minResponseTime}ms   | ${sequentialStats.maxResponseTime}ms   | ${(this.totalRequests/sequentialDuration).toFixed(1)}`);
    console.log(`Burst          | ${burstDuration.toFixed(2)}s    | ${burstStats.successRate.toFixed(1)}%      | ${burstStats.avgResponseTime.toFixed(0)}ms   | ${burstStats.minResponseTime}ms   | ${burstStats.maxResponseTime}ms   | ${(this.totalRequests/burstDuration).toFixed(1)}`);
    console.log('');

    // Detailed analysis for each test type
    this.printDetailedAnalysis('CONCURRENT', concurrentStats, this.results.concurrent);
    this.printDetailedAnalysis('SEQUENTIAL', sequentialStats, this.results.sequential);
    this.printDetailedAnalysis('BURST', burstStats, this.results.burst);

    // Performance recommendations
    this.printRecommendations(concurrentStats, sequentialStats, burstStats);
  }

  printDetailedAnalysis(testType, stats, results) {
    console.log(`📋 ${testType} TEST DETAILED ANALYSIS`);
    console.log('=' .repeat(60));
    console.log(`✅ Success Rate: ${stats.successRate.toFixed(2)}%`);
    console.log(`⏱️  Response Time Statistics:`);
    console.log(`   📊 Average: ${stats.avgResponseTime.toFixed(2)}ms`);
    console.log(`   ⚡ Minimum: ${stats.minResponseTime}ms`);
    console.log(`   🐌 Maximum: ${stats.maxResponseTime}ms`);
    console.log(`   📏 Median: ${stats.medianResponseTime}ms`);
    console.log(`   📊 95th Percentile: ${stats.p95ResponseTime}ms`);
    console.log(`   📊 99th Percentile: ${stats.p99ResponseTime}ms`);
    console.log('');

    // Response time distribution
    console.log('📊 Response Time Distribution:');
    const timeRanges = [
      { min: 0, max: 1000, label: '0-1s' },
      { min: 1000, max: 2000, label: '1-2s' },
      { min: 2000, max: 5000, label: '2-5s' },
      { min: 5000, max: 10000, label: '5-10s' },
      { min: 10000, max: Infinity, label: '10s+' }
    ];

    timeRanges.forEach(range => {
      const count = stats.responseTimes.filter(time => 
        time >= range.min && time < range.max
      ).length;
      const percentage = (count / stats.responseTimes.length * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 5));
      console.log(`   ${range.label.padEnd(8)}: ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
    });
    console.log('');

    // Error analysis if any
    const failedRequests = results.filter(r => !r.success);
    if (failedRequests.length > 0) {
      console.log('❌ Error Analysis:');
      const errorSummary = {};
      failedRequests.forEach(req => {
        const errorType = req.statusCode === 'NETWORK_ERROR' ? 'Network Error' : 
                         req.statusCode >= 500 ? 'Server Error' : 
                         req.statusCode >= 400 ? 'Client Error' : 'Other Error';
        errorSummary[errorType] = (errorSummary[errorType] || 0) + 1;
      });
      
      Object.entries(errorSummary).forEach(([errorType, count]) => {
        console.log(`   🔴 ${errorType}: ${count} requests`);
      });
      console.log('');
    }
  }

  printRecommendations(concurrentStats, sequentialStats, burstStats) {
    console.log('💡 PERFORMANCE RECOMMENDATIONS');
    console.log('=' .repeat(60));
    
    // Success rate recommendations
    const allSuccessRates = [concurrentStats.successRate, sequentialStats.successRate, burstStats.successRate];
    const avgSuccessRate = allSuccessRates.reduce((a, b) => a + b, 0) / allSuccessRates.length;
    
    if (avgSuccessRate < 95) {
      console.log('🔧 Consider implementing retry logic for failed requests');
      console.log('🔧 Review server error handling and logging');
    }
    
    // Response time recommendations
    const allAvgTimes = [concurrentStats.avgResponseTime, sequentialStats.avgResponseTime, burstStats.avgResponseTime];
    const avgResponseTime = allAvgTimes.reduce((a, b) => a + b, 0) / allAvgTimes.length;
    
    if (avgResponseTime > 5000) {
      console.log('⚡ Consider optimizing API response time');
      console.log('⚡ Implement caching for frequently requested content');
      console.log('⚡ Review Azure OpenAI service configuration');
    }
    
    // Concurrency recommendations
    if (concurrentStats.avgResponseTime > sequentialStats.avgResponseTime * 1.5) {
      console.log('🚀 High concurrency is causing performance degradation');
      console.log('🚀 Consider implementing request queuing or rate limiting');
    }
    
    // Consistency recommendations
    const allP95Times = [concurrentStats.p95ResponseTime, sequentialStats.p95ResponseTime, burstStats.p95ResponseTime];
    const avgP95Time = allP95Times.reduce((a, b) => a + b, 0) / allP95Times.length;
    
    if (avgP95Time > 10000) {
      console.log('📊 High 95th percentile suggests inconsistent performance');
      console.log('📊 Investigate outliers and implement monitoring');
    }
    
    console.log('');
    console.log('🎯 OPTIMAL CONFIGURATION SUGGESTIONS:');
    console.log('=' .repeat(60));
    
    // Find best performing test
    const tests = [
      { name: 'Concurrent', stats: concurrentStats, time: concurrentStats.avgResponseTime },
      { name: 'Sequential', stats: sequentialStats, time: sequentialStats.avgResponseTime },
      { name: 'Burst', stats: burstStats, time: burstStats.avgResponseTime }
    ];
    
    const bestTest = tests.reduce((best, current) => 
      current.stats.successRate > best.stats.successRate ? current : best
    );
    
    console.log(`🏆 Best Success Rate: ${bestTest.name} (${bestTest.stats.successRate.toFixed(1)}%)`);
    
    const fastestTest = tests.reduce((fastest, current) => 
      current.time < fastest.time ? current : fastest
    );
    
    console.log(`⚡ Fastest Average Response: ${fastestTest.name} (${fastestTest.time.toFixed(0)}ms)`);
    
    if (bestTest.name === 'Concurrent' && fastestTest.name === 'Concurrent') {
      console.log('✅ Concurrent processing is optimal for this API');
    } else if (bestTest.name === 'Sequential' && fastestTest.name === 'Sequential') {
      console.log('✅ Sequential processing is optimal for this API');
    } else {
      console.log('🔄 Consider hybrid approach based on use case');
    }
    
    console.log('');
    console.log('🏁 Advanced test suite completed!');
  }
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
async function runAdvancedTest() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:8000');
    console.log('💡 Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running! Starting advanced performance test...\n');
  
  const test = new AdvancedAPIPerformanceTest();
  await test.runAllTests();
}

runAdvancedTest().catch(console.error); 