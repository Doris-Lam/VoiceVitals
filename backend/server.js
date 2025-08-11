const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'VoiceVitals Backend Server Running!' });
});

// API endpoint for parsing symptoms (Step 4)
app.post('/api/parse-symptoms', (req, res) => {
  const { transcript } = req.body;
  
  console.log('Received transcript:', transcript);
  
  // For now, just return the transcript back
  res.json({ 
    message: 'Transcript received successfully',
    transcript: transcript,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
