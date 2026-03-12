const express = require('express');
const app = express();

// Render provides the port via process.env.PORT
const PORT = process.env.PORT || 3000; 

app.get('/', (req, res) => {
    res.send('Gemini Game Server is Live on Render!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});