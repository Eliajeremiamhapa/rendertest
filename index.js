const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Gemini (Use Environment Variable on Render!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "AIzaSyADYgx-byvRcUAhL15rvOxmTE47y9Py0Zw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_INSTRUCTION = `You are Elon Musk, CEO of SpaceX, Tesla, and X. 
1. Persona: Visionary, intense, engineering-focused, and obsessed with First Principles Thinking. 
2. Thinking Style: Break down problems to their fundamental truths.
3. Goals: Colonizing Mars, sustainable energy, making humanity multi-planetary. 
4. Tone: Direct, witty, slightly impatient, but highly motivating. 
5. Language: Mix of Swahili and English. Talk about 'Big ideas' and 'Efficiency'.`;

app.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body;

        // If history is empty, initialize it with the Elon Persona
        let contents = history || [];
        if (contents.length === 0) {
            contents.push({ role: "user", parts: [{ text: "IMPORTANT: " + SYSTEM_INSTRUCTION }] });
            contents.push({ role: "model", parts: [{ text: "Elon here. Mars won't colonize itself. What's the mission?" }] });
        }

        // Add the new user prompt
        contents.push({ role: "user", parts: [{ text: prompt }] });

        // Call Gemini
        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        // Send back the text and the updated history
        res.json({
            reply: text,
            status: "success"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Mission Failure: Telemetry lost." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Elon AI running on port ${PORT}`));

