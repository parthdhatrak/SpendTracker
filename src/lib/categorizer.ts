import { Category } from '@/models/Transaction';

// Merchant to category mappings
const CATEGORY_RULES: Record<string, Category> = {
    // Food
    'SWIGGY': 'Food',
    'ZOMATO': 'Food',
    'MCDONALDS': 'Food',
    'KFC': 'Food',
    'DOMINOS': 'Food',
    'BURGER KING': 'Food',
    'STARBUCKS': 'Food',
    'CAFE COFFEE DAY': 'Food',
    'BLINKIT': 'Food',
    'ZEPTO': 'Food',
    'DUNZO': 'Food',
    'BIGBASKET': 'Food',

    // Travel
    'OLA': 'Travel',
    'UBER': 'Travel',
    'RAPIDO': 'Travel',
    'IRCTC': 'Travel',
    'MAKEMYTRIP': 'Travel',
    'GOIBIBO': 'Travel',
    'REDBUS': 'Travel',
    'CLEARTRIP': 'Travel',

    // Shopping
    'AMAZON': 'Shopping',
    'FLIPKART': 'Shopping',
    'MYNTRA': 'Shopping',
    'AJIO': 'Shopping',
    'NYKAA': 'Shopping',
    'MEESHO': 'Shopping',
    'SNAPDEAL': 'Shopping',
    'DMART': 'Shopping',
    'RELIANCE': 'Shopping',

    // Entertainment
    'NETFLIX': 'Entertainment',
    'DISNEY+ HOTSTAR': 'Entertainment',
    'AMAZON PRIME': 'Entertainment',
    'SPOTIFY': 'Entertainment',
    'GAANA': 'Entertainment',
    'YOUTUBE': 'Entertainment',
    'BOOKMYSHOW': 'Entertainment',
    'PVR': 'Entertainment',
    'INOX': 'Entertainment',

    // Bills
    'AIRTEL': 'Bills',
    'JIO': 'Bills',
    'VI': 'Bills',
    'BSNL': 'Bills',
    'ELECTRICITY': 'Bills',
    'GAS': 'Bills',
    'WATER': 'Bills',
    'TATA POWER': 'Bills',
    'ADANI ELECTRICITY': 'Bills',

    // Health
    'APOLLO': 'Health',
    'PHARMEASY': 'Health',
    '1MG': 'Health',
    'NETMEDS': 'Health',
    'PRACTO': 'Health',

    // Education
    'COURSERA': 'Education',
    'UDEMY': 'Education',
    'UNACADEMY': 'Education',
    'BYJUS': 'Education',

    // Payments/Wallets (usually transfers)
    'PAYTM': 'Transfer',
    'PHONEPE': 'Transfer',
    'GOOGLE PAY': 'Transfer',
    'BHIM': 'Transfer',
    'CRED': 'Bills',
};

// Keyword-based category detection
const KEYWORD_CATEGORIES: Array<{ keywords: string[]; category: Category }> = [
    { keywords: ['FOOD', 'RESTAURANT', 'HOTEL', 'CAFE', 'BAKERY', 'PIZZA', 'BURGER'], category: 'Food' },
    { keywords: ['FLIGHT', 'TRAIN', 'BUS', 'TAXI', 'CAB', 'METRO', 'PETROL', 'FUEL', 'PARKING'], category: 'Travel' },
    { keywords: ['MALL', 'STORE', 'SHOP', 'RETAIL', 'MARKET', 'FASHION'], category: 'Shopping' },
    { keywords: ['MOVIE', 'CINEMA', 'THEATRE', 'GAME', 'GAMING'], category: 'Entertainment' },
    { keywords: ['BILL', 'ELECTRICITY', 'WATER', 'GAS', 'RECHARGE', 'PREPAID', 'POSTPAID'], category: 'Bills' },
    { keywords: ['HOSPITAL', 'CLINIC', 'DOCTOR', 'MEDICAL', 'PHARMACY', 'MEDICINE', 'HEALTH'], category: 'Health' },
    { keywords: ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'COURSE', 'TUITION', 'EXAM', 'BOOK'], category: 'Education' },
    { keywords: ['RENT', 'HOUSE', 'FLAT', 'APARTMENT', 'LANDLORD'], category: 'Rent' },
    { keywords: ['SALARY', 'WAGE', 'STIPEND', 'INCOME'], category: 'Salary' },
    { keywords: ['SIP', 'MUTUAL FUND', 'STOCK', 'SHARE', 'DEMAT', 'INVESTMENT', 'FD', 'RD'], category: 'Investment' },
    { keywords: ['TRANSFER', 'NEFT', 'RTGS', 'IMPS', 'SENT TO', 'RECEIVED FROM'], category: 'Transfer' },
];

export function categorizeTransaction(merchant: string, description: string, type: 'credit' | 'debit'): Category {
    const upperMerchant = merchant.toUpperCase();
    const upperDesc = description.toUpperCase();
    const combined = upperMerchant + ' ' + upperDesc;

    // Check for salary (credits)
    if (type === 'credit') {
        if (combined.includes('SALARY') || combined.includes('STIPEND') || combined.includes('WAGE')) {
            return 'Salary';
        }
    }

    // Check merchant-based rules first
    if (CATEGORY_RULES[upperMerchant]) {
        return CATEGORY_RULES[upperMerchant];
    }

    // Check partial merchant matches
    for (const [merchantName, category] of Object.entries(CATEGORY_RULES)) {
        if (upperMerchant.includes(merchantName) || combined.includes(merchantName)) {
            return category;
        }
    }

    // Check keyword-based rules
    for (const rule of KEYWORD_CATEGORIES) {
        if (rule.keywords.some(keyword => combined.includes(keyword))) {
            return rule.category;
        }
    }

    // Default category
    return 'Other';
}

// Get category color for UI
export const CATEGORY_COLORS: Record<Category, string> = {
    'Food': '#FF6384',
    'Travel': '#36A2EB',
    'Shopping': '#FFCE56',
    'Entertainment': '#9966FF',
    'Bills': '#FF9F40',
    'Health': '#4BC0C0',
    'Education': '#C9CBCF',
    'Rent': '#7C3AED',
    'Salary': '#10B981',
    'Investment': '#3B82F6',
    'Transfer': '#6B7280',
    'Other': '#9CA3AF',
};

// Get category icon
export const CATEGORY_ICONS: Record<Category, string> = {
    'Food': '🍔',
    'Travel': '✈️',
    'Shopping': '🛒',
    'Entertainment': '🎬',
    'Bills': '📄',
    'Health': '🏥',
    'Education': '📚',
    'Rent': '🏠',
    'Salary': '💰',
    'Investment': '📈',
    'Transfer': '↔️',
    'Other': '📦',
};
