import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Transaction from '@/models/Transaction';
// import Account from '@/models/Account';
import { getUserFromRequest } from '@/lib/auth';
import { parseStatement } from '@/lib/parsers/pdfParser';
import { mockStore } from '@/lib/store';

export async function POST(request: NextRequest) {
    try {
        const payload = await getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // await connectDB(); // Mock mode: skip DB

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bankName = formData.get('bankName') as string || 'Other';
        const accountType = formData.get('accountType') as string || 'savings';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Check file type
        if (!file.type.includes('pdf')) {
            return NextResponse.json(
                { error: 'Please upload a PDF file' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse the PDF
        const parsedTransactions = await parseStatement(buffer, bankName);

        if (parsedTransactions.length === 0) {
            return NextResponse.json(
                { error: 'No transactions found in the PDF. Please ensure it is a valid bank statement.' },
                { status: 400 }
            );
        }

        // Find or create account (Mock)
        let account = mockStore.getAccount(payload.userId, bankName);

        if (!account) {
            account = mockStore.createAccount({
                userId: payload.userId,
                bankName,
                accountType,
            });
        }

        // Create transactions (Mock)
        const newTxns = mockStore.addTransactions(
            parsedTransactions.map(t => ({
                accountId: account._id,
                userId: payload.userId,
                date: t.date,
                amount: t.amount,
                type: t.type,
                merchant: t.merchant,
                rawDescription: t.description,
                category: t.category,
                tags: t.tags,
                channel: t.channel,
                balanceAfter: t.balance,
            }))
        );

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${newTxns.length} transactions`,
            transactionCount: newTxns.length,
            account: {
                id: account._id,
                bankName: account.bankName,
            },
        });
    } catch (error) {
        console.error('PDF upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process PDF: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}
