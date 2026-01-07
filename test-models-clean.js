
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function test() {
    console.log('START');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try gemini-pro
    try {
        console.log('Testing gemini-pro...');
        const m = genAI.getGenerativeModel({ model: 'gemini-pro' });
        await m.generateContent('hi');
        console.log('GEMINI_PRO_OK');
    } catch (e) { console.log('GEMINI_PRO_FAIL: ' + e.message.split('\n')[0]); }

    // Try gemini-1.5-flash
    try {
        console.log('Testing gemini-1.5-flash...');
        const m = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        await m.generateContent('hi');
        console.log('GEMINI_1_5_FLASH_OK');
    } catch (e) { console.log('GEMINI_1_5_FLASH_FAIL: ' + e.message.split('\n')[0]); }

    // Try gemini-2.0-flash-exp (maybe this is what they have?)
    try {
        console.log('Testing gemini-2.0-flash-exp...');
        const m = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        await m.generateContent('hi');
        console.log('GEMINI_2_0_FLASH_EXP_OK');
    } catch (e) { console.log('GEMINI_2_0_FLASH_EXP_FAIL: ' + e.message.split('\n')[0]); }

    // Try gemini-2.0-flash (maybe this is what they have?)
    try {
        console.log('Testing gemini-2.0-flash...');
        const m = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        await m.generateContent('hi');
        console.log('GEMINI_2_0_FLASH_OK');
    } catch (e) { console.log('GEMINI_2_0_FLASH_FAIL: ' + e.message.split('\n')[0]); }
}
test();
