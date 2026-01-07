import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { mockStore } from '@/lib/store';

export async function GET(request: NextRequest) {
    try {
        const payload = await getUserFromRequest(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';

        const now = new Date();
        let startDate: Date | null = new Date();

        if (period === 'week') startDate.setDate(now.getDate() - 7);
        else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
        else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);
        else if (period === 'all') startDate = null; // No date filter

        // Filter transactions
        const allTransactions = mockStore.getTransactions(payload.userId);
        console.log(`[Analytics] User ${payload.userId}, Total transactions: ${allTransactions.length}, Period: ${period}`);

        const transactions = startDate
            ? allTransactions.filter(t => new Date(t.date) >= startDate!)
            : allTransactions; // No filter for 'all'

        console.log(`[Analytics] Filtered transactions: ${transactions.length}`);

        // Calculate summary
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === 'credit') totalIncome += t.amount;
            else totalExpense += t.amount;
        });

        const savings = totalIncome - totalExpense;

        // Category Breakdown
        const categoryMap = new Map<string, { amount: number; count: number }>();
        transactions.filter(t => t.type === 'debit').forEach(t => {
            const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
            categoryMap.set(t.category, {
                amount: current.amount + t.amount,
                count: current.count + 1
            });
        });

        const categoryBreakdown = Array.from(categoryMap.entries())
            .map(([category, data]) => ({
                category,
                amount: data.amount,
                count: data.count,
                percentage: totalExpense > 0 ? parseFloat(((data.amount / totalExpense) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        // Top Merchants
        const merchantMap = new Map<string, { amount: number; count: number }>();
        transactions.filter(t => t.type === 'debit').forEach(t => {
            const current = merchantMap.get(t.merchant) || { amount: 0, count: 0 };
            merchantMap.set(t.merchant, {
                amount: current.amount + t.amount,
                count: current.count + 1
            });
        });

        const topMerchants = Array.from(merchantMap.entries())
            .map(([merchant, data]) => ({
                merchant,
                amount: data.amount,
                count: data.count
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Daily Trends
        const trendsMap = new Map<string, { income: number; expense: number }>();

        transactions.forEach(t => {
            // Use logic to group by date
            const d = new Date(t.date);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            if (!trendsMap.has(dateStr)) trendsMap.set(dateStr, { income: 0, expense: 0 });

            const current = trendsMap.get(dateStr)!;
            if (t.type === 'credit') current.income += t.amount;
            else current.expense += t.amount;
        });

        const dailyTrends = Array.from(trendsMap.entries())
            .map(([date, data]) => ({
                date,
                income: data.income,
                expense: data.expense
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Generate Alerts
        const alerts: string[] = [];
        if (totalExpense > totalIncome && totalIncome > 0) alerts.push("⚠️ Expenses exceeded income this period.");
        if (categoryBreakdown.length > 0 && categoryBreakdown[0].percentage > 40) {
            alerts.push(`⚠️ High spending on ${categoryBreakdown[0].category} (${categoryBreakdown[0].percentage}% of total).`);
        }
        if (savings > 0 && savings < (totalIncome * 0.1)) {
            alerts.push("💡 Savings are less than 10% of income.");
        }
        if (savings < 0) {
            alerts.push("🚨 You are in negative cash flow.");
        }

        return NextResponse.json({
            period: { start: startDate, end: now },
            summary: {
                totalIncome,
                totalExpense,
                savings,
                transactionCount: transactions.length,
            },
            categoryBreakdown,
            topMerchants,
            dailyTrends,
            alerts
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
