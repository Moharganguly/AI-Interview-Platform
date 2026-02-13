const fetch = globalThis.fetch || require('node-fetch');
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NzExN2M4ZWU5YWJmMWE2YWU4NWM5MCIsImlhdCI6MTc2OTUzNjc1NiwiZXhwIjoxNzY5NjIzMTU2fQ.jWKsl2O1hzouDxo2nllvfFZOFU4pPSNwMdbWheo0Gh4';

async function run() {
  try {
    const createBody = { role: 'Test Role', level: 'junior', questions: ['Explain REST APIs'] };
    console.log('Creating interview...');
    const createResp = await fetch('http://localhost:5000/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(createBody),
    });
    const createData = await createResp.json();
    console.log('Create status:', createResp.status);
    console.log('Create response:', JSON.stringify(createData, null, 2));

    const interviewId = createData._id;
    if (!interviewId) {
      console.error('No interviewId returned. Aborting submit.');
      process.exit(1);
    }

    const submitBody = { interviewId, question: 'Explain REST APIs', answerText: 'This is a test answer' };
    console.log('Submitting answer...');
    const submitResp = await fetch('http://localhost:5000/api/interviews/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(submitBody),
    });
    const submitData = await submitResp.json();
    console.log('Submit status:', submitResp.status);
    console.log('Submit response:', JSON.stringify(submitData, null, 2));
  } catch (err) {
    console.error('Error during test:', err);
    process.exit(1);
  }
}

run();
