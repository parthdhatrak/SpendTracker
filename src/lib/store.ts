import { ParsedTransaction } from './parsers/pdfParser';
import { ITransaction } from '@/models/Transaction';

// Mock types matching Mongoose schemas roughly
export interface MockUser {
    _id: string;
    name: string;
    email: string;
}

export interface MockAccount {
    _id: string;
    userId: string;
    bankName: string;
    accountType: string;
}

export interface MockTransaction {
    _id: string;
    accountId: string;
    userId: string;
    date: Date;
    amount: number;
    type: 'credit' | 'debit';
    merchant: string;
    rawDescription: string;
    category: string;
    tags: string[];
    channel: string;
    balanceAfter?: number;
    createdAt: Date;
}

class MockStore {
    users: MockUser[] = [{
        _id: '507f1f77bcf86cd799439011',
        name: 'Demo User',
        email: 'demo@example.com'
    }];
    accounts: MockAccount[] = [];
    transactions: MockTransaction[] = [];

    constructor() {
        console.log('MockStore initialized');
    }

    // Transactions
    addTransactions(txns: Omit<MockTransaction, '_id' | 'createdAt'>[]) {
        const newTxns = txns.map(t => ({
            ...t,
            _id: Math.random().toString(36).substring(2, 15),
            createdAt: new Date(),
        }));
        this.transactions.push(...newTxns);
        return newTxns;
    }

    getTransactions(userId: string) {
        return this.transactions
            .filter(t => t.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Accounts
    getAccount(userId: string, bankName: string) {
        return this.accounts.find(a => a.userId === userId && a.bankName === bankName);
    }

    createAccount(account: Omit<MockAccount, '_id'>) {
        const newAccount = {
            ...account,
            _id: Math.random().toString(36).substring(2, 15),
        };
        this.accounts.push(newAccount);
        return newAccount;
    }
}

// Persist store across hot reloads in dev
const globalForMock = global as unknown as { mockStore: MockStore };
export const mockStore = globalForMock.mockStore || new MockStore();
if (process.env.NODE_ENV !== 'production') globalForMock.mockStore = mockStore;
