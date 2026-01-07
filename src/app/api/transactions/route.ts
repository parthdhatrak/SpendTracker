import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/store';

export async function GET(request: NextRequest) {
    try {
        const payload = await getUserFromRequest(request);

        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse query params
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        // const sortBy = searchParams.get('sortBy') || 'date';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        // Get all transactions
        let transactions = mockStore.getTransactions(payload.userId);

        // Apply filters
        if (category && category !== 'All') {
            transactions = transactions.filter(t => t.category === category);
        }

        if (type && type !== 'all') {
            transactions = transactions.filter(t => t.type === type);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            transactions = transactions.filter(t =>
                t.merchant.toLowerCase().includes(searchLower) ||
                t.rawDescription.toLowerCase().includes(searchLower)
            );
        }

        // Sort (already sorted by date desc in getTransactions, just handle direction if needed)
        if (sortOrder === 'asc') {
            transactions.reverse();
        }

        // Pagination
        const total = transactions.length;
        const skip = (page - 1) * limit;
        const paginatedTransactions = transactions.slice(skip, skip + limit);

        return NextResponse.json({
            transactions: paginatedTransactions,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error('Transactions fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await getUserFromRequest(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();

        // Determine account (mock)
        let account = mockStore.getAccount(payload.userId, body.bankName || 'Manual');
        if (!account) {
            account = mockStore.createAccount({
                userId: payload.userId,
                bankName: body.bankName || 'Manual',
                accountType: 'cash',
            });
        }

        const newTxns = mockStore.addTransactions([{
            userId: payload.userId,
            accountId: account._id,
            date: new Date(body.date),
            amount: Number(body.amount),
            type: body.type,
            merchant: body.merchant || body.description,
            rawDescription: body.description,
            category: body.category || 'Other',
            channel: 'manual',
            tags: [],
        }]);

        return NextResponse.json({ success: true, transaction: newTxns[0] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const payload = await getUserFromRequest(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { transactionIds } = await request.json();

        if (!Array.isArray(transactionIds)) {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        // Mock delete
        mockStore.transactions = mockStore.transactions.filter(t => !transactionIds.includes(t._id));

        return NextResponse.json({ success: true, count: transactionIds.length });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 });
    }
}
