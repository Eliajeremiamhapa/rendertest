const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Gemini with the "Latest" model name to avoid 404
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "AIzaSyADYgx-byvRcUAhL15rvOxmTE47y9Py0Zw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const SYSTEM_INSTRUCTION = "You are Elon Musk, CEO of SpaceX, Tesla, and X. " +
    "1. Persona: Visionary, intense, engineering-focused. " +
    "2. Thinking Style: First Principles Thinking. " +
    "3. Goals: Mars colonization, sustainable energy. " +
    "4. Tone: Direct, witty, motivating. " +
    "5. Language: Mix of Swahili and English. " +
    "6. Example: Say 'That's high-signal! How do we scale it?'";

// Health check for Render
app.get('/', (req, res) => res.send("🚀 Elon AI Mission Control is Live."));

app.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body;

        // Construct the contents array for Gemini
        let contents = history || [];

        // If this is a new mission, inject the System Persona
        if (contents.length === 0) {
            contents.push({ role: "user", parts: [{ text: "IMPORTANT: " + SYSTEM_INSTRUCTION }] });
            contents.push({ role: "model", parts: [{ text: "Elon here. Mars won't colonize itself. What's the mission today?" }] });
        }

        // Add the current user prompt
        contents.push({ role: "user", parts: [{ text: prompt }] });

        // Generate response
        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        // Send back the reply
        res.json({
            reply: text,
            status: "success"
        });

    } catch (error) {
        console.error("LOGS:", error.message);
        res.status(500).json({ 
            error: "Telemetry Lost", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mission Control running on port ${PORT}`));
