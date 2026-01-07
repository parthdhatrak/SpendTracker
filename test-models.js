
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function testModels() {
    console.log("Testing models with API Key ending in " + process.env.GEMINI_API_KEY.slice(-4));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = [
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    for (const modelName of modelsToTest) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            const response = await result.response;
            console.log(`SUCCESS: ${modelName}`);
            console.log("Response:", response.text().substring(0, 50));
        } catch (e) {
            console.log(`FAILED: ${modelName}`);
            console.log(`Error: ${e.message.split('\n')[0]}`);
            if (e.message.includes("404")) console.log("Status: 404 Not Found");
            if (e.message.includes("429")) console.log("Status: 429 Quota Exceeded");
        }
    }
}

testModels();
