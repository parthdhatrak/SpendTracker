import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'credit' | 'debit';
export type Channel = 'UPI' | 'Card' | 'NetBanking' | 'Cash' | 'Other';
export type Category =
    | 'Food'
    | 'Travel'
    | 'Shopping'
    | 'Entertainment'
    | 'Bills'
    | 'Health'
    | 'Education'
    | 'Rent'
    | 'Salary'
    | 'Investment'
    | 'Transfer'
    | 'Other';

export interface ITransaction extends Document {
    _id: mongoose.Types.ObjectId;
    accountId: mongoose.Types.ObjectId;
    userId: string;
    date: Date;
    amount: number;
    type: TransactionType;
    merchant: string;
    rawDescription: string;
    category: Category;
    tags: string[];
    channel: Channel;
    balanceAfter?: number;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
    {
        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'Account',
            required: [true, 'Account ID is required'],
        },
        userId: {
            type: String, // Clerk ID
            required: [true, 'User ID is required'],
            index: true,
        },
        date: {
            type: Date,
            required: [true, 'Transaction date is required'],
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        type: {
            type: String,
            enum: ['credit', 'debit'],
            required: [true, 'Transaction type is required'],
        },
        merchant: {
            type: String,
            required: true,
            trim: true,
        },
        rawDescription: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Rent', 'Salary', 'Investment', 'Transfer', 'Other'],
            default: 'Other',
        },
        tags: {
            type: [String],
            default: [],
        },
        channel: {
            type: String,
            enum: ['UPI', 'Card', 'NetBanking', 'Cash', 'Other'],
            default: 'Other',
        },
        balanceAfter: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, merchant: 1 });
TransactionSchema.index({ accountId: 1, date: -1 });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
