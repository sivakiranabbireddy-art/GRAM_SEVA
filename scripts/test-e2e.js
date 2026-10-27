const http = require('http');

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function put(url, body, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runE2ETest() {
  console.log('====================================================');
  console.log('   🌾 GramSeva End-to-End Workflow Verification     ');
  console.log('====================================================');

  const BASE = 'http://localhost:5000/api';
  const testId = Date.now().toString().slice(-5);
  const testCustomerEmail = `test.cust.${testId}@example.com`;
  const testWorkerEmail = `test.worker.${testId}@example.com`;

  // Step 1 & 2: Customer OTP & Register
  console.log('\n[1/16] Customer OTP Request...');
  const custOtpRes = await post(`${BASE}/auth/request-otp`, { email: testCustomerEmail, name: 'Test Customer' });
  if (custOtpRes.status !== 200) throw new Error(`OTP Request failed: ${JSON.stringify(custOtpRes.body)}`);
  console.log('✓ Customer OTP generated:', custOtpRes.body.devOtp || 'Dispatched via email');

  console.log('\n[2/16] Customer Registration with OTP...');
  const custRegRes = await post(`${BASE}/auth/register-customer`, {
    name: 'Test Customer',
    email: testCustomerEmail,
    phone: '9998887771',
    password: 'Password@123',
    address: 'Plot 55, Ward 3',
    locality: 'Shanti Nagar',
    pincode: '500001',
    otp: custOtpRes.body.devOtp
  });
  if (custRegRes.status !== 201) throw new Error(`Customer register failed: ${JSON.stringify(custRegRes.body)}`);
  const customerToken = custRegRes.body.token;
  console.log('✓ Customer registered successfully, token acquired.');

  // Step 3: Customer Login Verification
  console.log('\n[3/16] Customer Login Verification...');
  const custLoginRes = await post(`${BASE}/auth/login`, {
    email: testCustomerEmail,
    password: 'Password@123',
    requestedRole: 'CUSTOMER'
  });
  if (custLoginRes.status !== 200) throw new Error(`Customer login failed: ${JSON.stringify(custLoginRes.body)}`);
  console.log('✓ Customer authentication verified.');

  // Step 4 & 5: Worker OTP & Register
  console.log('\n[4/16] Worker OTP Request...');
  const workOtpRes = await post(`${BASE}/auth/request-otp`, { email: testWorkerEmail, name: 'Test Worker' });
  if (workOtpRes.status !== 200) throw new Error(`Worker OTP failed: ${JSON.stringify(workOtpRes.body)}`);

  console.log('\n[5/16] Worker Registration with Skills & Area...');
  const workRegRes = await post(`${BASE}/auth/register-worker`, {
    name: 'Test Worker',
    email: testWorkerEmail,
    phone: '9998887772',
    password: 'Password@123',
    skills: ['Plumbing', 'Electrical Services'],
    experienceYears: 5,
    serviceArea: 'Shanti Nagar',
    pincode: '500001',
    description: 'Experienced master plumber & electrician.',
    otp: workOtpRes.body.devOtp
  });
  if (workRegRes.status !== 201) throw new Error(`Worker register failed: ${JSON.stringify(workRegRes.body)}`);
  const workerToken = workRegRes.body.token;
  const workerId = workRegRes.body.user.id;
  console.log('✓ Worker registered. Status:', workRegRes.body.user.status, '(Pending Approval)');

  // Step 6: Admin Login & Approval of Worker
  console.log('\n[6/16] Admin Login & Approving Worker...');
  const adminLoginRes = await post(`${BASE}/auth/admin-login`, {
    email: 'admin@gramseva.in',
    password: 'Admin@12345'
  });
  if (adminLoginRes.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.body)}`);
  const adminToken = adminLoginRes.body.token;
  console.log('✓ Admin authenticated.');

  const approveRes = await put(`${BASE}/admin/workers/${workerId}/approve`, {}, adminToken);
  if (approveRes.status !== 200) throw new Error(`Worker approval failed: ${JSON.stringify(approveRes.body)}`);
  console.log('✓ Worker approved by Admin:', approveRes.body.worker.status);

  // Step 7: Customer Submits Service Request
  console.log('\n[7/16] Customer Submits Service Request...');
  const bookingRes = await post(`${BASE}/customer/bookings`, {
    categoryId: 'cat_plumbing',
    description: 'Underground pipeline pressure valve jammed in garden area.',
    address: 'Plot 55, Ward 3',
    locality: 'Shanti Nagar',
    pincode: '500001',
    preferredDate: '2026-10-20',
    preferredTimeSlot: '10:00 AM - 01:00 PM',
    contactNumber: '9998887771'
  }, customerToken);
  if (bookingRes.status !== 201) throw new Error(`Booking creation failed: ${JSON.stringify(bookingRes.body)}`);
  const bookingId = bookingRes.body.booking.id;
  console.log(`✓ Booking created: ${bookingId} (Status: ${bookingRes.body.booking.status})`);

  // Step 8: Algorithmic Worker Matching
  console.log('\n[8/16] Rule-Based Candidate Matching for Booking...');
  const matchRes = await get(`${BASE}/admin/bookings/${bookingId}/candidates`, adminToken);
  if (matchRes.status !== 200) throw new Error(`Matching failed: ${JSON.stringify(matchRes.body)}`);
  console.log(`✓ Algorithmic matching found ${matchRes.body.candidates.length} suitable candidate(s).`);
  const topCandidate = matchRes.body.candidates[0];
  console.log(`   Top Candidate: ${topCandidate.name} (Score: ${topCandidate.score}/100)`);
  console.log(`   Breakdown reasons:`, topCandidate.matchReasons.join(' | '));

  // Step 9: Admin Assigns Worker
  console.log('\n[9/16] Admin Assigns Worker to Booking...');
  const assignRes = await put(`${BASE}/admin/bookings/${bookingId}/assign`, { workerId: topCandidate.workerId }, adminToken);
  if (assignRes.status !== 200) throw new Error(`Assignment failed: ${JSON.stringify(assignRes.body)}`);
  console.log('✓ Worker assigned. Booking status:', assignRes.body.booking.status);

  // Step 10: Worker Accepts Assignment
  console.log('\n[10/16] Worker Accepts Assignment...');
  const acceptRes = await put(`${BASE}/worker/tasks/${bookingId}/accept`, {}, workerToken);
  if (acceptRes.status !== 200) throw new Error(`Worker accept failed: ${JSON.stringify(acceptRes.body)}`);
  console.log('✓ Worker accepted. Status:', acceptRes.body.booking.status);

  // Step 11: Worker Starts and Completes Task
  console.log('\n[11/16] Worker Commences and Completes Task...');
  const startRes = await put(`${BASE}/worker/tasks/${bookingId}/start`, {}, workerToken);
  console.log('✓ Work started. Status:', startRes.body.booking.status);

  const completeRes = await put(`${BASE}/worker/tasks/${bookingId}/complete`, {
    completionNote: 'Unjammed valve, replaced gasket, pressure normalized at 2.4 bar.'
  }, workerToken);
  if (completeRes.status !== 200) throw new Error(`Worker complete failed: ${JSON.stringify(completeRes.body)}`);
  console.log('✓ Worker marked complete. Status:', completeRes.body.booking.status);

  // Step 12: Customer Confirms Completion
  console.log('\n[12/16] Customer Confirms Completion...');
  const confirmRes = await put(`${BASE}/customer/bookings/${bookingId}/confirm`, {}, customerToken);
  if (confirmRes.status !== 200) throw new Error(`Customer confirm failed: ${JSON.stringify(confirmRes.body)}`);
  console.log('✓ Completion confirmed. Final Status:', confirmRes.body.booking.status);

  // Step 13: Customer Submits Feedback
  console.log('\n[13/16] Customer Submits Rating & Review...');
  const feedbackRes = await post(`${BASE}/feedback`, {
    bookingId,
    rating: 5,
    review: 'Exceptional plumbing repair! Fixed the valve within an hour.',
    tags: ['Punctuality', 'Work Quality', 'Cleanliness']
  }, customerToken);
  if (feedbackRes.status !== 201) throw new Error(`Feedback failed: ${JSON.stringify(feedbackRes.body)}`);
  console.log('✓ 5-Star feedback submitted successfully.');

  // Step 14: Admin Analytics & Stats Verification
  console.log('\n[14/16] Admin Dashboard Metrics Verification...');
  const statsRes = await get(`${BASE}/admin/stats`, adminToken);
  if (statsRes.status !== 200) throw new Error(`Stats fetch failed: ${JSON.stringify(statsRes.body)}`);
  console.log('✓ Admin metrics updated:');
  console.log(`   Total Bookings: ${statsRes.body.stats.totalRequests}`);
  console.log(`   Completed Bookings: ${statsRes.body.stats.completedBookings}`);
  console.log(`   Approved Workers: ${statsRes.body.stats.approvedWorkers}`);

  // Step 15: RBAC Route Security Checks
  console.log('\n[15/16] Verifying Role-Based Access Control (RBAC)...');
  const custTriesAdmin = await get(`${BASE}/admin/stats`, customerToken);
  if (custTriesAdmin.status !== 403) throw new Error('Security flaw: Customer was not blocked from admin endpoint!');
  console.log('✓ Customer correctly rejected from Admin endpoint (HTTP 403 Forbidden).');

  const workerTriesAdmin = await get(`${BASE}/admin/stats`, workerToken);
  if (workerTriesAdmin.status !== 403) throw new Error('Security flaw: Worker was not blocked from admin endpoint!');
  console.log('✓ Worker correctly rejected from Admin endpoint (HTTP 403 Forbidden).');

  const unauthTriesCustomer = await get(`${BASE}/customer/bookings`);
  if (unauthTriesCustomer.status !== 401) throw new Error('Security flaw: Unauthenticated user was not blocked!');
  console.log('✓ Unauthenticated request blocked (HTTP 401 Unauthorized).');

  // Step 16: File Data Persistence Check
  console.log('\n[16/16] Verifying Data Persistence in Local JSON Files...');
  const fs = require('fs');
  const path = require('path');
  const bookingsFile = path.join(__dirname, '..', 'server', 'data', 'bookings.json');
  const rawData = fs.readFileSync(bookingsFile, 'utf-8');
  if (!rawData.includes(bookingId)) throw new Error('Data persistence failed: New booking was not found in bookings.json file!');
  console.log(`✓ Booking ${bookingId} found persistently stored in server/data/bookings.json.`);

  console.log('\n====================================================');
  console.log('🎉 ALL 16 E2E WORKFLOW TESTS PASSED SUCCESSFULLY!    ');
  console.log('====================================================');
}

runE2ETest().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  process.exit(1);
});
