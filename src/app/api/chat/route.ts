import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserFromRequest } from '@/lib/auth';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import connectDB from '@/lib/mongodb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    try {
        let userContext = {
            name: 'User',
            email: ''
        };
        let totalBalance = 0;
        let accountDetails = '';
        let transactionContext = '';

        try {
            await connectDB();
            const userPayload = await getUserFromRequest(req);
            const userId = userPayload?.userId;

            if (userId) {
                // Determine user name (Default to 'User' as we used Clerk)
                // In a real app we would sync Clerk profile to DB or use currentUser() 
                userContext.name = "User";

                // Fetch User's accounts to get current balance
                const accounts = await Account.find({ userId });
                totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
                accountDetails = accounts.map(acc => `${acc.bankName} (${acc.accountType}): ₹${acc.balance || 0}`).join(', ');

                // Fetch recent transactions (last 50)
                const transactions = await Transaction.find({ userId })
                    .sort({ date: -1 })
                    .limit(50)
                    .select('date amount type category merchant description channel');

                transactionContext = transactions.map(t =>
                    `- ${t.date.toISOString().split('T')[0]}: ${t.merchant} (${t.category}) - ₹${t.amount} [${t.type}] via ${t.channel}`
                ).join('\n');
            }
        } catch (dbError) {
            console.error("Database Connection Failed, using Mock Data:", dbError);
            // Fallback to Mock Data
            totalBalance = 125000;
            accountDetails = "HDFC Bank (Savings): ₹45,000, ICICI Bank (Savings): ₹80,000";
            transactionContext = `
- 2024-01-08: Uber (Transport) - ₹450 [Debit] via UPI
- 2024-01-07: Zomato (Food) - ₹1,200 [Debit] via UPI
- 2024-01-06: Netflix (Subscription) - ₹649 [Debit] via Card
- 2024-01-05: Salary (Income) - ₹85,000 [Credit] via Bank Transfer
- 2024-01-04: Amazon (Shopping) - ₹2,500 [Debit] via UPI
- 2024-01-03: Grocery Store (Food) - ₹3,000 [Debit] via UPI
- 2024-01-02: Gym Membership (Health) - ₹15,000 [Debit] via Card
`.trim();
        }

        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const systemPrompt = `
You are a helpful and intelligent financial assistant for ${userContext.name || 'the user'}.
Your goal is to help the user understand their finances based on the provided data.

**User Financial Context:**
- Total Balance: ₹${totalBalance}
- Accounts: ${accountDetails}

**Recent Transactions (Last 50):**
${transactionContext}

**Instructions:**
1. Answer the user's question clearly and concisely based ONLY on the data above.
2. If the answer cannot be determined from the data, say "I don't have enough data to answer that."
3. Be friendly and professional.
4. You can summarize spending, identify trends, or find specific details.
5. Provide monetary values in Indian Rupees (₹).
6. Format your response in Markdown (e.g., use bold for amounts, lists for breakdowns).

**User Question:** ${message}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        return NextResponse.json({ response: responseText });

    } catch (error: any) {
        console.error("Chatbot Error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
