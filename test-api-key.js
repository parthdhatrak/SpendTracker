// Quick test to verify Gemini API key
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('\n=== Gemini API Key Test ===\n');

    // Check if key exists
    if (!apiKey) {
        console.log('❌ GEMINI_API_KEY is NOT SET in .env.local');
        return;
    }

    console.log('✓ API Key found');
    console.log('  Key starts with:', apiKey.slice(0, 7));
    console.log('  Key ends with:', apiKey.slice(-4));
    console.log('  Key length:', apiKey.length);

    // Check key format
    if (!apiKey.startsWith('AIzaSy')) {
        console.log('\n⚠️  WARNING: Key does not start with "AIzaSy" - might be invalid format');
    }

    // Try a simple API call
    console.log('\n📡 Testing API connection with gemini-1.5-flash...');

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Say "Hello" in one word');
        const response = result.response.text();

        console.log('✅ SUCCESS! API responded:', response.trim());
        console.log('\nYour API key is working correctly!');

    } catch (error) {
        console.log('\n❌ API ERROR:', error.message);

        if (error.message.includes('API_KEY_INVALID')) {
            console.log('\n💡 Your API key is INVALID. Please:');
            console.log('   1. Go to https://aistudio.google.com/app/apikey');
            console.log('   2. Create a new API key');
            console.log('   3. Copy it exactly (no extra spaces)');
        } else if (error.message.includes('429')) {
            console.log('\n💡 RATE LIMITED. This usually means:');
            console.log('   - Key might still be from old account');
            console.log('   - Try gemini-1.5-flash instead of gemini-2.0-flash');
        }
    }
}

testApiKey();
