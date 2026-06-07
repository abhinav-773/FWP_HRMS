const axios = require('axios');

async function run() {
  try {
    // 1. Login as recruiter to get token
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'hr@example.com', // Replace with an actual HR email if known, or bypass
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;

    // 2. Fetch first application
    const appRes = await axios.get('http://localhost:5000/api/v1/applications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const applications = appRes.data.data;
    if (applications.length === 0) {
      console.log("No applications found. Create one first.");
      return;
    }

    const appId = applications[0].id;
    const userId = loginRes.data.data.user.id;

    // 3. Schedule AI_VOICE interview
    const scheduleRes = await axios.post('http://localhost:5000/api/v1/interviews', {
      applicationId: appId,
      interviewerId: userId,
      type: 'AI_VOICE',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMins: 30
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Created AI Interview:", scheduleRes.data);
    console.log(`Test link: http://localhost:3000/ai-interview/${scheduleRes.data.data.id}`);

  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

run();
