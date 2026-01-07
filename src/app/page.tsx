import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded-full text-sm font-medium border border-zinc-800">
              Your Personal CFO 📊
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="text-white">
              Track Your
            </span>
            <br />
            <span className="text-zinc-400">
              UPI Spending
            </span>
          </h1>

          <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10">
            Upload bank statements or paste SMS messages. Get instant insights,
            categorized expenses, and smart alerts to manage your money better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
            >
              <Button size="lg" className="px-8 py-6 text-lg bg-white text-black hover:bg-zinc-200 border-0 rounded-xl">
                Open Dashboard →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            Everything you need to manage spending
          </h2>
          <p className="text-zinc-500 text-center mb-12 max-w-2xl mx-auto">
            No more messy spreadsheets. Upload once, get insights forever.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 border border-zinc-700">
                <span className="text-2xl grayscale">📄</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">PDF Statement Import</h3>
              <p className="text-zinc-400">
                Upload HDFC, SBI, ICICI bank statements. We extract and categorize all transactions automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 border border-zinc-700">
                <span className="text-2xl grayscale">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">SMS Transaction Parser</h3>
              <p className="text-zinc-400">
                Paste your bank SMS messages. We understand &quot;Rs 500 debited from A/C...&quot; and extract merchant info.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 border border-zinc-700">
                <span className="text-2xl grayscale">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Smart Insights</h3>
              <p className="text-zinc-400">
                Category breakdown, spending trends, top merchants, and alerts when spending increases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-zinc-900/20 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Auto-categorized for you
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: '🍔', name: 'Food' },
              { icon: '✈️', name: 'Travel' },
              { icon: '🛒', name: 'Shopping' },
              { icon: '🎬', name: 'Entertainment' },
              { icon: '📄', name: 'Bills' },
              { icon: '🏥', name: 'Health' },
              { icon: '📚', name: 'Education' },
              { icon: '🏠', name: 'Rent' },
            ].map((cat) => (
              <span
                key={cat.name}
                className="px-4 py-2 rounded-full text-sm font-medium border bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800 transition-colors"
                title={cat.name}
              >
                <span className="grayscale mr-2">{cat.icon}</span>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to take control of your finances?
          </h2>
          <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
            Join thousands of Indians who are already tracking their UPI spends smarter.
          </p>
          <Link
            href="/register"
          >
            <Button size="lg" className="px-8 py-6 text-lg bg-white text-black hover:bg-zinc-200 border-0 rounded-xl">
              Start Tracking Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-900 bg-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl grayscale">💰</span>
            <span className="font-bold text-lg text-white">SpendTracker</span>
          </div>
          <p className="text-zinc-600 text-sm">
            Your data stays secure. We never share your financial information.
          </p>
        </div>
      </footer>
    </div>
  );
}
