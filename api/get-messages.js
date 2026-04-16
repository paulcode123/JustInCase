const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple authentication - in production, use proper auth
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer admin-secret-key') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const submissionsFile = path.join(process.cwd(), 'data', 'submissions.json');

    if (!fs.existsSync(submissionsFile)) {
      return res.status(200).json({ submissions: [] });
    }

    const data = fs.readFileSync(submissionsFile, 'utf8');
    const submissions = JSON.parse(data);

    res.status(200).json({ submissions });
  } catch (error) {
    console.error('Error reading submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};