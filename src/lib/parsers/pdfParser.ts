// @ts-ignore
import PDFParser from 'pdf2json';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TransactionType, Category, Channel } from '@/models/Transaction';
import { normalizeTransaction } from '../normalizer';
import { categorizeTransaction } from '../categorizer';

export interface ParsedTransaction {
    date: Date;
    description: string;
    amount: number;
    type: TransactionType;
    balance?: number;
    merchant: string;
    channel: Channel;
    category: Category;
    tags: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Using gemini-2.5-flash - verified to work with current API key
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // true = text content only

        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            // Extract text from the parsed data
            // pdf2json returns URL-encoded text, so we need to decode it
            const text = pdfParser.getRawTextContent();
            resolve(text);
        });

        pdfParser.parseBuffer(buffer);
    });
}


export async function parseWithGemini(text: string): Promise<ParsedTransaction[]> {
    const prompt = `
    Analyze the following bank statement text and extract all transactions into a JSON array.
    
    The output must be a valid JSON array of objects with this schema:
    [{
        "date": "ISO date string",
        "description": "Clean description",
        "amount": number (positive),
        "type": "credit" | "debit",
        "merchant": "Merchant name",
        "category": "Food" | "Travel" | "Shopping" | "Entertainment" | "Bills" | "Health" | "Education" | "Rent" | "Salary" | "Investment" | "Transfer" | "Other",
        "channel": "UPI" | "Card" | "NetBanking" | "Cash" | "Other",
        "balance": number (optional)
    }]

    Rules:
    - Ignore headers, footers, and page numbers.
    - If a category is not clear, use 'Other'.
    - If channel is not clear, use 'Other'.
    - Extract meaningful merchant names.
    - Return ONLY the JSON array, no markdown formatting.

    Text to analyze:
    ${text.substring(0, 30000)} // Truncate to avoid token limits if necessary
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        let textResponse = response.text();

        // Clean up markdown code blocks if present
        textResponse = textResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

        const rawTransactions = JSON.parse(textResponse);

        // Map to ParsedTransaction to ensure types and perform fallback normalization if needed
        return rawTransactions.map((t: any) => {
            // Fallback normalization/categorization if Gemini missed it or for consistency
            const normalized = normalizeTransaction(t.description);
            const fallbackCategory = categorizeTransaction(normalized.merchant, t.description, t.type);

            return {
                date: new Date(t.date),
                description: t.description,
                amount: t.amount,
                type: t.type as TransactionType,
                balance: t.balance,
                merchant: t.merchant || normalized.merchant,
                channel: (t.channel as Channel) || 'Other',
                category: (t.category as Category) || fallbackCategory,
                tags: normalized.tags,
            };
        });

    } catch (error: any) {
        console.error("Gemini Parsing Error:", error);
        throw new Error("Gemini Parsing Error: " + (error.message || error));
    }
}

// Generic parser that now uses Gemini
// Generic parser that now uses Gemini
export async function parseBankStatementPDF(buffer: Buffer): Promise<ParsedTransaction[]> {
    try {
        const text = await extractTextFromPDF(buffer);

        // Use Gemini for parsing
        return await parseWithGemini(text);

    } catch (error) {
        console.error("PDF Text Extraction Error:", error);
        throw new Error("Failed to parse PDF: " + String(error));
    }
}

// Keep these exports for backward compatibility, but they all use the generic Gemini parser now
export async function parseHDFCStatement(buffer: Buffer): Promise<ParsedTransaction[]> {
    return parseBankStatementPDF(buffer);
}

export async function parseSBIStatement(buffer: Buffer): Promise<ParsedTransaction[]> {
    return parseBankStatementPDF(buffer);
}

export async function parseICICIStatement(buffer: Buffer): Promise<ParsedTransaction[]> {
    return parseBankStatementPDF(buffer);
}

export async function parseStatement(buffer: Buffer, bankHint?: string): Promise<ParsedTransaction[]> {
    // We ignore bankHint now because Gemini is smart enough to handle generic text
    return parseBankStatementPDF(buffer);
}

