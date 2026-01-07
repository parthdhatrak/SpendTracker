import { Category, Channel } from '@/models/Transaction';

// Merchant name mappings for normalization
const MERCHANT_MAPPINGS: Record<string, string> = {
    // Food & Delivery
    'SWIGGY': 'SWIGGY',
    'SWIGGY INSTAMART': 'SWIGGY',
    'SWIGGY*FOOD': 'SWIGGY',
    'SWIGGYINSTAMART': 'SWIGGY',
    'ZOMATO': 'ZOMATO',
    'ZOMATO*': 'ZOMATO',
    'ZOMATO HYPERPURE': 'ZOMATO',
    'BLINKIT': 'BLINKIT',
    'GROFERS': 'BLINKIT',
    'ZEPTO': 'ZEPTO',
    'DUNZO': 'DUNZO',
    'DOMINOS': 'DOMINOS',
    'MCDONALDS': 'MCDONALDS',
    'MCD': 'MCDONALDS',
    'KFC': 'KFC',
    'BURGER KING': 'BURGER KING',
    'STARBUCKS': 'STARBUCKS',
    'CCD': 'CAFE COFFEE DAY',
    'CAFE COFFEE DAY': 'CAFE COFFEE DAY',

    // Ride & Travel
    'OLA': 'OLA',
    'OLACABS': 'OLA',
    'UBER': 'UBER',
    'UBER INDIA': 'UBER',
    'RAPIDO': 'RAPIDO',
    'IRCTC': 'IRCTC',
    'MAKEMYTRIP': 'MAKEMYTRIP',
    'MMT': 'MAKEMYTRIP',
    'GOIBIBO': 'GOIBIBO',
    'REDBUS': 'REDBUS',
    'CLEARTRIP': 'CLEARTRIP',

    // Shopping
    'AMAZON': 'AMAZON',
    'AMAZON PAY': 'AMAZON',
    'AMZN': 'AMAZON',
    'FLIPKART': 'FLIPKART',
    'MYNTRA': 'MYNTRA',
    'AJIO': 'AJIO',
    'NYKAA': 'NYKAA',
    'MEESHO': 'MEESHO',
    'SNAPDEAL': 'SNAPDEAL',
    'BIGBASKET': 'BIGBASKET',
    'DMART': 'DMART',
    'RELIANCE': 'RELIANCE',

    // Entertainment
    'NETFLIX': 'NETFLIX',
    'HOTSTAR': 'DISNEY+ HOTSTAR',
    'DISNEY': 'DISNEY+ HOTSTAR',
    'PRIME VIDEO': 'AMAZON PRIME',
    'PRIME': 'AMAZON PRIME',
    'SPOTIFY': 'SPOTIFY',
    'GAANA': 'GAANA',
    'YOUTUBE': 'YOUTUBE',
    'BOOKMYSHOW': 'BOOKMYSHOW',
    'PVR': 'PVR',
    'INOX': 'INOX',

    // Bills & Utilities
    'AIRTEL': 'AIRTEL',
    'JIO': 'JIO',
    'RELIANCE JIO': 'JIO',
    'VI': 'VI',
    'VODAFONE': 'VI',
    'IDEA': 'VI',
    'BSNL': 'BSNL',
    'ELECTRICITY': 'ELECTRICITY',
    'GAS': 'GAS',
    'WATER': 'WATER',
    'TATA POWER': 'TATA POWER',
    'ADANI': 'ADANI ELECTRICITY',

    // Payments & Wallets
    'PAYTM': 'PAYTM',
    'PHONEPE': 'PHONEPE',
    'GPAY': 'GOOGLE PAY',
    'GOOGLEPAY': 'GOOGLE PAY',
    'GOOGLE PAY': 'GOOGLE PAY',
    'BHIM': 'BHIM',
    'CRED': 'CRED',
};

// Noise words to remove from descriptions
const NOISE_WORDS = [
    'POS',
    'UPI-',
    'UPI/',
    'NEFT-',
    'NEFT/',
    'IMPS-',
    'IMPS/',
    'RTGS-',
    'RTGS/',
    'ATM-',
    'ATM/',
    'VIA',
    'REF',
    'TXN',
    'TRANSACTION',
    'DEBIT',
    'CREDIT',
    'DR',
    'CR',
    'INR',
    'RS',
    'RS.',
    'PAYMENT',
    'PAID',
    'TO',
    'FROM',
    'FOR',
    'THE',
    'AND',
    '*',
    '-',
    '/',
    '@',
];

export interface NormalizedTransaction {
    merchant: string;
    channel: Channel;
    tags: string[];
    cleanDescription: string;
}

export function normalizeMerchant(rawDescription: string): string {
    const upperDesc = rawDescription.toUpperCase();

    // Check for known merchant patterns
    for (const [pattern, normalizedName] of Object.entries(MERCHANT_MAPPINGS)) {
        if (upperDesc.includes(pattern)) {
            return normalizedName;
        }
    }

    // If no known merchant, clean and return the description
    let cleaned = rawDescription;
    NOISE_WORDS.forEach(word => {
        // Escape special regex characters before creating RegExp
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        cleaned = cleaned.replace(new RegExp(escapedWord, 'gi'), '');
    });

    return cleaned.trim().toUpperCase() || 'UNKNOWN';
}

export function detectChannel(description: string): Channel {
    const upperDesc = description.toUpperCase();

    if (upperDesc.includes('UPI') || upperDesc.includes('@')) {
        return 'UPI';
    }
    if (upperDesc.includes('POS') || upperDesc.includes('CARD') || upperDesc.includes('VISA') || upperDesc.includes('MASTERCARD')) {
        return 'Card';
    }
    if (upperDesc.includes('NEFT') || upperDesc.includes('RTGS') || upperDesc.includes('IMPS')) {
        return 'NetBanking';
    }
    if (upperDesc.includes('ATM') || upperDesc.includes('CASH')) {
        return 'Cash';
    }

    return 'Other';
}

export function cleanDescription(rawDescription: string): string {
    let cleaned = rawDescription;

    // Remove common noise patterns
    NOISE_WORDS.forEach(word => {
        cleaned = cleaned.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
    });

    // Remove multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Remove transaction IDs (long alphanumeric strings)
    cleaned = cleaned.replace(/[A-Z0-9]{12,}/gi, '');

    return cleaned.trim();
}

export function generateTags(merchant: string, description: string): string[] {
    const tags: string[] = [];
    const combined = (merchant + ' ' + description).toUpperCase();

    // Food related
    if (['SWIGGY', 'ZOMATO', 'FOOD', 'RESTAURANT', 'CAFE', 'COFFEE', 'MCDONALDS', 'KFC', 'DOMINOS'].some(k => combined.includes(k))) {
        tags.push('food');
    }

    // Groceries
    if (['BIGBASKET', 'DMART', 'GROFERS', 'BLINKIT', 'ZEPTO', 'INSTAMART', 'GROCERY'].some(k => combined.includes(k))) {
        tags.push('groceries');
    }

    // Subscription
    if (['NETFLIX', 'SPOTIFY', 'HOTSTAR', 'PRIME', 'SUBSCRIPTION'].some(k => combined.includes(k))) {
        tags.push('subscription');
    }

    // Recharge
    if (['AIRTEL', 'JIO', 'VI', 'VODAFONE', 'RECHARGE', 'PREPAID'].some(k => combined.includes(k))) {
        tags.push('recharge');
    }

    // Travel
    if (['OLA', 'UBER', 'RAPIDO', 'IRCTC', 'FLIGHT', 'TRAIN', 'BUS', 'TRAVEL'].some(k => combined.includes(k))) {
        tags.push('travel');
    }

    return tags;
}

export function normalizeTransaction(rawDescription: string): NormalizedTransaction {
    const merchant = normalizeMerchant(rawDescription);
    const channel = detectChannel(rawDescription);
    const cleanDesc = cleanDescription(rawDescription);
    const tags = generateTags(merchant, rawDescription);

    return {
        merchant,
        channel,
        tags,
        cleanDescription: cleanDesc,
    };
}
