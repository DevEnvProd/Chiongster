'use client'

import Link from 'next/link';
import { Gift, ChevronRight, Beer, Coins } from 'lucide-react';
import Header from '@/components/header'
import { Footer } from '@/components/footer';

interface Transaction {
  id: string;
  type: 'bonus' | 'benefit' | 'drink' | 'redeem';
  description: string;
  amount: number;
  date: string;
}

const transactions: Record<string, Transaction[]> = {
  '16 September 2024': [
    {
      id: '1',
      type: 'bonus',
      description: "Insider Bonus (Friend's Name)",
      amount: 5,
      date: '16 September 2024',
    },
    {
      id: '2',
      type: 'benefit',
      description: 'Insider Benefits',
      amount: 12,
      date: '16 September 2024',
    },
    {
      id: '3',
      type: 'drink',
      description: 'Drink Dollars (Empire Ktv)',
      amount: 30,
      date: '16 September 2024',
    },
  ],
  '12 September 2024': [
    {
      id: '4',
      type: 'benefit',
      description: 'Insider Benefits',
      amount: 12,
      date: '12 September 2024',
    },
    {
      id: '5',
      type: 'redeem',
      description: 'Item Redeem - 1 can of Beer - Tiger',
      amount: -12,
      date: '12 September 2024',
    },
  ],
};

const TransactionIcon = ({ type }: { type: Transaction['type'] }) => {
  switch (type) {
    case 'bonus':
      return (
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-dd-insider-bonus.svg`}
            alt="Dollar Coin"
            className="w-10 h-10"
          />
        </div>
      );
    case 'benefit':
      return (
        <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
          <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-dd-insider-benefit.svg`}
            alt="Dollar Coin"
            className="w-10 h-10"
          />
        </div>
      );
    case 'drink':
      return (
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
          <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-dd-drink-dollar.svg`}
            alt="Dollar Coin"
            className="w-10 h-10"
          />
        </div>
      );
    case 'redeem':
      return (
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Beer className="w-5 h-5 text-white" />
        </div>
      );
    default:
      return null;
  }
};

export default function DrinkDollarsPage() {
  const totalDrinkDollars = 59;

  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <Header />
      {/* Breadcrumb */}
      <div className="px-4 py-4 space-x-2 text-sm">
        <Link href="/" className="text-zinc-400 hover:text-white">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-400">My Drink Dollars</span>
      </div>

      {/* Total Drink Dollars Card */}
      <div className="px-4 mb-4">
        {/* Total Drink Dollars Card */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            {/* Icon or Image */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img
                src="/path-to-beer-mug-icon.png"
                alt="Drink Mug Icon"
                className="w-full h-full"
              />
            </div>
            <div>
              <div className="text-sm text-white">Total Drink Dollars</div>
              <div className="text-4xl font-bold flex items-center gap-1">
                <span className="text-white">59</span>
                <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                  alt="Dollar Coin"
                  className="w-10 h-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS Link */}
        <button className="mt-2 text-pink-500 text-xs font-medium underline block text-center">
          HOW IT WORKS
        </button>
      </div>



      {/* Redeem Banner */}
      <div className="px-4 mb-6">
        <button className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍸</span>
            <div>
              <div className="font-semibold">Thirsty? Redeem Now!</div>
              <div className="text-sm text-zinc-400">And earn more benefits</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-600" />
        </button>
      </div>

      {/* Transactions History */}
      <div className="px-4">
        <h2 className="text-xl font-bold font-furuta mb-1">My Transactions History</h2>
        <p className="text-sm text-zinc-400 mb-6">
          All transactions completed in the past 3 months
        </p>

        <div className="space-y-6">
          {Object.entries(transactions).map(([date, dateTransactions]) => (
            <div key={date}>
              <h3 className="text-sm font-medium mb-3">{date}</h3>
              <div className="space-y-3">
                {dateTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-zinc-900 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <TransactionIcon type={transaction.type} />
                      <span className="text-sm">{transaction.description}</span>
                    </div>
                    <span
                      className={`text-sm font-semibold flex items-center ${
                        transaction.amount > 0 ? 'text-[#FFA500]' : 'text-white'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                      <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/icons/icon-drink-dollar.svg`}
                        alt="Dollar Coin"
                        className="w-5 h-5"
                      />
                    </span>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

