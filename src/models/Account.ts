import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    bankName: string;
    accountType: 'savings' | 'current' | 'credit';
    accountNumber: string;
    createdAt: Date;
    updatedAt: Date;
}

const AccountSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        bankName: {
            type: String,
            required: [true, 'Bank name is required'],
            enum: ['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Other'],
            default: 'Other',
        },
        accountType: {
            type: String,
            enum: ['savings', 'current', 'credit'],
            default: 'savings',
        },
        accountNumber: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for user's accounts
AccountSchema.index({ userId: 1, bankName: 1 });

const Account: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export default Account;
