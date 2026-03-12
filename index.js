const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Fixed Model Name for Node.js SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "AIzaSyADYgx-byvRcUAhL15rvOxmTE47y9Py0Zw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const SYSTEM_INSTRUCTION = `You are Elon Musk. Tone: Visionary, direct. Language: Mix Swahili and English. Focus on Mars and First Principles.`;

// 2. Health Check Route (Open this in your browser to test)
app.get('/', (req, res) => {
    res.send("<h1>Elon AI Backend is Online! 🚀</h1><p>Send a POST request to /chat to start the mission.</p>");
});

app.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body;
        let contents = history || [];

        if (contents.length === 0) {
            contents.push({ role: "user", parts: [{ text: "SYSTEM: " + SYSTEM_INSTRUCTION }] });
            contents.push({ role: "model", parts: [{ text: "Elon here. Mars won't colonize itself. What's the mission?" }] });
        }

        contents.push({ role: "user", parts: [{ text: prompt }] });

        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text, status: "success" });

    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
        res.status(500).json({ error: "Mission Failure", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
