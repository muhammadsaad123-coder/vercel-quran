const { spawn } = require('child_process');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { query, searchType, ngramType } = req.body;

    if (!query || !searchType || !ngramType) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Define the path to your Python script
    const scriptPath = path.join(__dirname, '../../scripts', `${searchType}_search_script.py`);

    // Execute the Python script with the necessary arguments
    const pythonProcess = spawn('python', [scriptPath, query, ngramType]);

    let result = '';

    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    // When the Python process finishes, send the result
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.status(200).json(JSON.parse(result)); // Return the JSON response
      } else {
        res.status(500).json({ error: 'An error occurred during the search.' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};
