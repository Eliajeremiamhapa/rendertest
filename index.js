const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Gemini with correct model naming & Fallback protection
const GEMINI_KEY = process.env.GEMINI_KEY || "AIzaSyADYgx-byvRcUAhL15rvOxmTE47y9Py0Zw";
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// Use gemini-1.5-flash-latest for stability in Node.js
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    // Learned from 500 errors: Disable safety blocks that trigger on the 'Elon' persona
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ]
});

const SYSTEM_INSTRUCTION = `You are Elon Musk, CEO of SpaceX, Tesla, and X.
1. Persona: Visionary, engineering-focused, First Principles Thinking.
2. Tone: Direct, witty, slightly impatient, but motivating.
3. Language: Mix of Swahili and English.
4. Focus: Mars, Efficiency, and 'High-Signal' ideas.`;

// Health check for Render
app.get('/', (req, res) => res.send("🚀 Elon AI Mission Control is Online."));

app.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Payload missing: Prompt required." });
        }

        // Initialize content with history
        let contents = Array.isArray(history) ? history : [];

        // If history is empty, start with the System Persona
        if (contents.length === 0) {
            contents.push({ 
                role: "user", 
                parts: [{ text: "SYSTEM INSTRUCTION: " + SYSTEM_INSTRUCTION + "\nRespond to this: Elon, mission start." }] 
            });
            // Note: We don't push the model response yet; we let Gemini generate it or just start.
        }

        // Add the current user prompt
        contents.push({ role: "user", parts: [{ text: prompt }] });

        // Generate response using the official SDK method
        const result = await model.generateContent({ contents });
        const response = await result.response;
        
        // Safety check to ensure we actually got text back
        const text = response.text();

        if (!text) {
            throw new Error("Empty telemetry: AI refused to answer.");
        }

        res.json({
            reply: text,
            status: "success"
        });

    } catch (error) {
        // LEARNED: Log the full error to Render console but send readable details to Frontend
        console.error("MISSION ERROR:", error.message);
        
        res.status(500).json({ 
            error: "Telemetry Lost", 
            details: error.message,
            advice: "Check API Key or Model Quota."
        });
    }
});

const PORT = process.env.PORT || 10000; // Render prefers port 10000 or process.env.PORT
app.listen(PORT, () => console.log(`Elon AI running on port ${PORT}`));
