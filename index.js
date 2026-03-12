const express = require('express');
const cors = require('cors'); // 1. Import the cors package
const app = express();

// 2. Use CORS middleware so your HTML file/Android app can talk to the server
app.use(cors()); 

// 3. Optional: Parse JSON bodies (useful for Gemini prompts later)
app.use(express.json());

const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => {
    res.send('Gemini Game Server is Live on Render!');
});

// 4. Add the route your HTML tester is calling
app.get('/test-game', (req, res) => {
    res.json({
        status: "success",
        message: "Connection established with Render!",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
