const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, email, subject, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      firstName,
      email,
      subject: subject || '',
      message,
      read: false
    };

    // For Vercel, we'll use a simple JSON file storage
    // In production, you'd want a proper database
    const dataDir = path.join(process.cwd(), 'data');
    const submissionsFile = path.join(dataDir, 'submissions.json');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Read existing submissions
    let submissions = [];
    if (fs.existsSync(submissionsFile)) {
      const data = fs.readFileSync(submissionsFile, 'utf8');
      submissions = JSON.parse(data);
    }

    // Add new submission
    submissions.push(submission);

    // Write back to file
    fs.writeFileSync(submissionsFile, JSON.stringify(submissions, null, 2));

    res.status(200).json({ success: true, message: 'Message received successfully' });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};