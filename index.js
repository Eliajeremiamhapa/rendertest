const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "AIzaSyADYgx-byvRcUAhL15rvOxmTE47y9Py0Zw");
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // Adding safety settings to prevent the "empty response" crash
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
});

const SYSTEM_INSTRUCTION = `You are Elon Musk, CEO of SpaceX, Tesla, and X. 
Persona: Visionary, intense, engineering-focused. Use a mix of Swahili and English. 
Goal: Colonizing Mars. Be direct and witty.`;

app.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Launch aborted: No prompt provided." });
        }

        // Build contents array correctly
        let contents = history || [];
        
        if (contents.length === 0) {
            contents.push({ role: "user", parts: [{ text: "SYSTEM: " + SYSTEM_INSTRUCTION }] });
            contents.push({ role: "model", parts: [{ text: "Elon here. Mars mission is primary. Ready for input." }] });
        }

        contents.push({ role: "user", parts: [{ text: prompt }] });

        // Generate Content
        const result = await model.generateContent({ contents });
        const response = await result.response;
        
        // Safety Check: Check if response has candidates
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("Gemini returned no candidates (Possible safety block).");
        }

        const text = response.text();

        res.json({
            reply: text,
            status: "success"
        });

    } catch (error) {
        // This log will appear in your Render "Logs" tab
        console.error("CRITICAL ERROR:", error.message);

        // Send the ACTUAL error message back to your local tester
        res.status(500).json({ 
            error: "Mission Failure: Telemetry lost.",
            details: error.message 
        });
    }
});

// Default route for health check
app.get('/', (req, res) => res.send("Elon AI is Online."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Elon AI running on port ${PORT}`));
