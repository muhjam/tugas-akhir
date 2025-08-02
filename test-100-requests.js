// Using built-in fetch (available in Node.js 18+)
// For older Node.js versions, you may need to install and use node-fetch

class HundredRequestTest {
  constructor() {
    this.baseURL = 'http://localhost:8000';
    this.totalRequests = 100;
    this.results = [];
    this.startTime = null;
    this.endTime = null;
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

      return {
        requestNumber,
        success: response.ok && !!responseData.result,
        responseTime,
        statusCode: response.status,
        hasResult: !!responseData.result,
        resultLength: responseData.result ? responseData.result.length : 0,
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
    console.log('🚀 TESTING 100 REQUESTS TO API GENERATE');
    console.log('=' .repeat(60));
    console.log(`📊 Target: ${this.totalRequests} requests to /api/generate`);
    console.log(`🎯 Mode: detail (single question generation)`);
    console.log(`🌐 Base URL: ${this.baseURL}`);
    console.log('=' .repeat(60));
    console.log('');

    this.startTime = Date.now();
    console.log(`⏰ Test started at: ${new Date().toLocaleString()}`);
    console.log('');

    // Create array of promises for concurrent requests
    const promises = [];
    for (let i = 1; i <= this.totalRequests; i++) {
      promises.push(this.testRequest(i));
    }

    console.log('🔄 Executing 100 concurrent requests...');
    console.log('⏳ This may take several minutes depending on API response time...');
    console.log('');

    // Execute all requests concurrently
    this.results = await Promise.all(promises);
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
    
    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const medianResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length / 2)] : 0;
    
    const p95ResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] : 0;
    const p99ResponseTime = sortedResponseTimes.length > 0 ? 
      sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] : 0;

    const successRate = (successfulRequests.length / this.totalRequests) * 100;
    const requestsPerSecond = (this.totalRequests / (totalTime / 1000)).toFixed(2);

    // MAIN SUMMARY
    console.log('📈 RANGKUMAN HASIL TEST 100 REQUEST');
    console.log('=' .repeat(60));
    console.log(`⏱️  TOTAL WAKTU TEST: ${(totalTime / 1000).toFixed(2)} DETIK`);
    console.log(`📊 TOTAL REQUEST: ${this.totalRequests}`);
    console.log(`✅ REQUEST BERHASIL: ${successfulRequests.length}`);
    console.log(`❌ REQUEST GAGAL: ${failedRequests.length}`);
    console.log(`📈 TINGKAT KEBERHASILAN: ${successRate.toFixed(2)}%`);
    console.log(`🚀 REQUEST PER DETIK: ${requestsPerSecond}`);
    console.log('');

    // RESPONSE TIME STATISTICS
    console.log('⏱️  STATISTIK WAKTU RESPONSE (dalam milidetik)');
    console.log('=' .repeat(60));
    console.log(`📊 Rata-rata: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`⚡ Tercepat: ${minResponseTime}ms`);
    console.log(`🐌 Terlama: ${maxResponseTime}ms`);
    console.log(`📏 Median: ${medianResponseTime}ms`);
    console.log(`📊 95th Percentile: ${p95ResponseTime}ms`);
    console.log(`📊 99th Percentile: ${p99ResponseTime}ms`);
    console.log('');

    // TIME ANALYSIS
    console.log('⏰ ANALISIS WAKTU');
    console.log('=' .repeat(60));
    const totalSeconds = totalTime / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    console.log(`🕐 Total waktu: ${minutes} menit ${seconds.toFixed(2)} detik`);
    console.log(`⚡ Rata-rata per request: ${(totalSeconds / this.totalRequests).toFixed(2)} detik`);
    console.log(`🚀 Throughput: ${requestsPerSecond} request/detik`);
    console.log('');

    // SUCCESS/FAILURE ANALYSIS
    if (failedRequests.length > 0) {
      console.log('❌ ANALISIS REQUEST GAGAL');
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

    // RESPONSE TIME DISTRIBUTION
    console.log('📊 DISTRIBUSI WAKTU RESPONSE');
    console.log('=' .repeat(60));
    const timeRanges = [
      { min: 0, max: 1000, label: '0-1 detik' },
      { min: 1000, max: 2000, label: '1-2 detik' },
      { min: 2000, max: 5000, label: '2-5 detik' },
      { min: 5000, max: 10000, label: '5-10 detik' },
      { min: 10000, max: 30000, label: '10-30 detik' },
      { min: 30000, max: Infinity, label: '30+ detik' }
    ];

    timeRanges.forEach(range => {
      const count = responseTimes.filter(time => 
        time >= range.min && time < range.max
      ).length;
      const percentage = (count / responseTimes.length * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(percentage / 5));
      console.log(`${range.label.padEnd(12)}: ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
    });
    console.log('');

    // PERFORMANCE ASSESSMENT
    console.log('🎯 PENILAIAN PERFORMANCE');
    console.log('=' .repeat(60));
    
    // Success rate assessment
    if (successRate >= 95) {
      console.log('✅ EXCELLENT: Tingkat keberhasilan di atas 95%');
    } else if (successRate >= 90) {
      console.log('🟡 GOOD: Tingkat keberhasilan di atas 90%');
    } else if (successRate >= 80) {
      console.log('🟠 FAIR: Tingkat keberhasilan di atas 80%');
    } else {
      console.log('🔴 POOR: Tingkat keberhasilan di bawah 80%');
    }

    // Response time assessment
    if (avgResponseTime < 2000) {
      console.log('✅ EXCELLENT: Rata-rata response time di bawah 2 detik');
    } else if (avgResponseTime < 5000) {
      console.log('🟡 GOOD: Rata-rata response time di bawah 5 detik');
    } else if (avgResponseTime < 10000) {
      console.log('🟠 FAIR: Rata-rata response time di bawah 10 detik');
    } else {
      console.log('🔴 POOR: Rata-rata response time di atas 10 detik');
    }

    // Throughput assessment
    if (requestsPerSecond >= 10) {
      console.log('✅ EXCELLENT: Throughput tinggi (>10 req/detik)');
    } else if (requestsPerSecond >= 5) {
      console.log('🟡 GOOD: Throughput sedang (5-10 req/detik)');
    } else if (requestsPerSecond >= 2) {
      console.log('🟠 FAIR: Throughput rendah (2-5 req/detik)');
    } else {
      console.log('🔴 POOR: Throughput sangat rendah (<2 req/detik)');
    }
    console.log('');

    // RECOMMENDATIONS
    console.log('💡 REKOMENDASI');
    console.log('=' .repeat(60));
    if (successRate < 95) {
      console.log('🔧 Pertimbangkan implementasi retry logic untuk request yang gagal');
    }
    if (avgResponseTime > 5000) {
      console.log('⚡ Pertimbangkan optimasi response time API atau implementasi caching');
    }
    if (p95ResponseTime > 10000) {
      console.log('📊 95th percentile tinggi menunjukkan performa tidak konsisten - investigasi outlier');
    }
    if (requestsPerSecond < 5) {
      console.log('🚀 Pertimbangkan implementasi request batching atau parallel processing');
    }
    console.log('');

    // DETAILED RESULTS (First 20 requests)
    console.log('📋 HASIL DETAIL (20 Request Pertama)');
    console.log('=' .repeat(60));
    this.results.slice(0, 20).forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.responseTime}ms`;
      const seconds = (result.responseTime / 1000).toFixed(2);
      console.log(`${status} Request ${result.requestNumber.toString().padStart(3)}: ${time.padStart(8)} (${seconds}s) | Status: ${result.statusCode}`);
    });
    
    if (this.results.length > 20) {
      console.log(`... dan ${this.results.length - 20} request lainnya`);
    }
    console.log('');

    // FINAL SUMMARY
    console.log('🏁 RANGKUMAN AKHIR');
    console.log('=' .repeat(60));
    console.log(`📊 Total 100 request selesai dalam ${(totalTime / 1000).toFixed(2)} detik`);
    console.log(`✅ ${successfulRequests.length} request berhasil (${successRate.toFixed(1)}%)`);
    console.log(`⚡ Rata-rata response time: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`🚀 Throughput: ${requestsPerSecond} request/detik`);
    console.log('');
    console.log('🎉 Test 100 request selesai!');
  }
}

// Check if server is running before starting test
async function checkServer() {
  try {
    const response = await fetch('http://localhost:8000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test', mode: 'detail', lang: 'id' }),
      timeout: 10000 // 10 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('Error checking server:', error.message);
    return false;
  }
}

// Main execution
async function runTest() {
  console.log('🔍 Memeriksa apakah server berjalan...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server tidak berjalan di http://localhost:8000');
    console.log('💡 Silakan jalankan server dengan: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server berjalan! Memulai test 100 request...\n');
  
  const test = new HundredRequestTest();
  await test.runTest();
}

runTest().catch(console.error); 