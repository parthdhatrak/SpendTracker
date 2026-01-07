import { normalizeTransaction } from '../normalizer';
import { categorizeTransaction } from '../categorizer';
import { TransactionType, Channel } from '@/models/Transaction';

export interface ParsedSMSTransaction {
    amount: number;
    type: TransactionType;
    merchant: string;
    accountNumber?: string;
    date: Date;
    description: string;
    channel: Channel;
    category: string;
    tags: string[];
    balance?: number;
}

// Common SMS patterns from Indian banks
const SMS_PATTERNS = [
    // Pattern: Rs XXX debited from A/C XXXX at MERCHANT
    {
        regex: /Rs\.?\s*([\d,]+\.?\d*)\s*(debited|credited)\s*(?:from|to)\s*(?:A\/C|Ac|Account|a\/c)\s*[X*]*(\d{4})\s*(?:at|for|to|@)?\s*(.+?)(?:\s*on\s*(\d{2}[\/\-]\d{2}[\/\-]\d{2,4}))?/i,
        extract: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[1].replace(/,/g, '')),
            type: match[2].toLowerCase() === 'credited' ? 'credit' : 'debit' as TransactionType,
            accountNumber: match[3],
            merchant: match[4].trim(),
            dateStr: match[5],
        }),
    },
    // Pattern: INR XXX debited from SBI A/c X1234
    {
        regex: /(?:INR|Rs\.?)\s*([\d,]+\.?\d*)\s*(debited|credited)\s*(?:from|to)\s*(?:[\w]+\s*)?(?:A\/C|Ac|Account|a\/c)\s*[X*]*(\d{3,4})/i,
        extract: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[1].replace(/,/g, '')),
            type: match[2].toLowerCase() === 'credited' ? 'credit' : 'debit' as TransactionType,
            accountNumber: match[3],
            merchant: '',
            dateStr: undefined,
        }),
    },
    // Pattern: UPI payment of Rs XXX to MERCHANT
    {
        regex: /UPI\s*(?:payment|txn|transaction)?\s*(?:of)?\s*(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:to|from)\s*(.+?)(?:\s*(?:successful|completed|done))?(?:\s*Ref\s*No)?/i,
        extract: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[1].replace(/,/g, '')),
            type: 'debit' as TransactionType,
            accountNumber: undefined,
            merchant: match[2].trim(),
            dateStr: undefined,
        }),
    },
    // Pattern: Your A/c XXXX credited with Rs XXX
    {
        regex: /(?:Your\s*)?(?:A\/C|Ac|Account|a\/c)\s*[X*]*(\d{4})\s*(credited|debited)\s*(?:with)?\s*(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i,
        extract: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[3].replace(/,/g, '')),
            type: match[2].toLowerCase() === 'credited' ? 'credit' : 'debit' as TransactionType,
            accountNumber: match[1],
            merchant: '',
            dateStr: undefined,
        }),
    },
    // Pattern: Amount Rs XXX debited 
    {
        regex: /(?:Amount\s*)?(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(debited|credited|withdrawn|deposited)/i,
        extract: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[1].replace(/,/g, '')),
            type: ['credited', 'deposited'].includes(match[2].toLowerCase()) ? 'credit' : 'debit' as TransactionType,
            accountNumber: undefined,
            merchant: '',
            dateStr: undefined,
        }),
    },
    // Pattern: Transaction of Rs XXX
    {
        regex: /(?:Transaction|Txn|Payment)\s*(?:of)?\s*(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s*(?:at|to|from)?\s*(.+?)(?:\s*(?:on|dated))?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})?/i,
        extract: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[1].replace(/,/g, '')),
            type: 'debit' as TransactionType,
            accountNumber: undefined,
            merchant: match[2]?.trim() || '',
            dateStr: match[3],
        }),
    },
];

// Balance pattern
const BALANCE_PATTERN = /(?:Available|Avl|Bal|Balance)[:\s]*(?:Rs\.?|INR)?\s*([\d,]+\.?\d*)/i;

// Date extractor
function extractDate(smsText: string, dateStr?: string): Date {
    if (dateStr) {
        // Try DD/MM/YYYY or DD-MM-YYYY
        let match = dateStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (match) {
            return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
        // Try DD/MM/YY
        match = dateStr.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{2})/);
        if (match) {
            const year = parseInt(match[3]) > 50 ? 1900 + parseInt(match[3]) : 2000 + parseInt(match[3]);
            return new Date(year, parseInt(match[2]) - 1, parseInt(match[1]));
        }
    }

    // Try to find date in SMS text
    const dateMatch = smsText.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})/);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        let year = parseInt(dateMatch[3]);
        if (year < 100) {
            year = year > 50 ? 1900 + year : 2000 + year;
        }
        return new Date(year, month, day);
    }

    // Default to current date
    return new Date();
}

// Extract balance from SMS
function extractBalance(smsText: string): number | undefined {
    const match = smsText.match(BALANCE_PATTERN);
    if (match) {
        return parseFloat(match[1].replace(/,/g, ''));
    }
    return undefined;
}

// Detect channel from SMS text
function detectSMSChannel(text: string): Channel {
    const upper = text.toUpperCase();
    if (upper.includes('UPI') || upper.includes('@')) return 'UPI';
    if (upper.includes('POS') || upper.includes('CARD')) return 'Card';
    if (upper.includes('NEFT') || upper.includes('IMPS') || upper.includes('RTGS')) return 'NetBanking';
    if (upper.includes('ATM') || upper.includes('CASH')) return 'Cash';
    return 'Other';
}

export function parseSMS(smsText: string): ParsedSMSTransaction | null {
    const trimmedText = smsText.trim();

    for (const pattern of SMS_PATTERNS) {
        const match = trimmedText.match(pattern.regex);
        if (match) {
            const extracted = pattern.extract(match);

            // Skip if amount is 0 or unreasonable
            if (!extracted.amount || extracted.amount <= 0 || extracted.amount > 10000000) {
                continue;
            }

            // Normalize the merchant
            const normalized = normalizeTransaction(extracted.merchant || trimmedText);
            const category = categorizeTransaction(normalized.merchant, trimmedText, extracted.type);

            return {
                amount: extracted.amount,
                type: extracted.type,
                merchant: normalized.merchant || 'UNKNOWN',
                accountNumber: extracted.accountNumber,
                date: extractDate(trimmedText, extracted.dateStr),
                description: trimmedText,
                channel: detectSMSChannel(trimmedText),
                category,
                tags: normalized.tags,
                balance: extractBalance(trimmedText),
            };
        }
    }

    return null;
}

// Parse multiple SMS messages (one per line or separated by blank lines)
export function parseMultipleSMS(text: string): ParsedSMSTransaction[] {
    const messages = text
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .filter(msg => msg.trim().length > 0);

    const transactions: ParsedSMSTransaction[] = [];

    for (const msg of messages) {
        const parsed = parseSMS(msg);
        if (parsed) {
            transactions.push(parsed);
        }
    }

    return transactions;
}
