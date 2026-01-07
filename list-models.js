// List available Gemini models
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Fetching available models...\n');

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const data = await response.json();

        if (data.error) {
            console.log('Error:', data.error.message);
            return;
        }

        console.log('Available models:\n');
        data.models?.forEach(model => {
            if (model.supportedGenerationMethods?.includes('generateContent')) {
                console.log(`  - ${model.name.replace('models/', '')}`);
            }
        });

        // Test with gemini-2.0-flash-exp
        console.log('\n\nTesting with gemini-2.0-flash-exp...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const testModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await testModel.generateContent('Say hi');
        console.log('✅ SUCCESS with gemini-2.0-flash-exp:', result.response.text().trim());

    } catch (error) {
        console.log('Error:', error.message);
    }
}

listModels();
