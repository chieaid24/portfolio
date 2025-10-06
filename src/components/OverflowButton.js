'use client';
import { useMoney } from '@/lib/money-context';

export default function DevMoneyReset({ className = '' }) {
  const { triggerOverflowFx, ready } = useMoney();

  if (process.env.NODE_ENV === 'production') return null;

  return (
    <button
      type="button"
      onClick={triggerOverflowFx}
      disabled={!ready}
      className={`ml-2 text-[10px] sm:text-xs font-mono px-2 py-1 rounded border bg-gray-200 hover:bg-gray-300 ${className}`}
      title="Reset money state"
    >
      overflow
    </button>
  );
}