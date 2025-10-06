'use client';

import { useState } from 'react';
import { useMoney } from '@/lib/money-context';

export default function DevBalanceInput({ className = '' }) {
  const { inputBalance } = useMoney();
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    setErr('');

    //client-side validation (the reducer also validates)
    const cleaned = val.replace(/[,$\s]/g, '');
    const n = Number.parseFloat(cleaned);
    if (!Number.isFinite(n) || n <= 0) {
      setErr('Enter a positive number, e.g. 123.45');
      return;
    }

    inputBalance(val); // pass original string; reducer normalizes
    setVal('');
  };

  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-0 ${className}`}>
      <input
        type="text"
        inputMode="decimal"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Type here"
        className="h-5 w-12 rounded-md px-2 text-xs bg-black/10 outline-none"
        aria-label="Set balance"
      />
      <button
        type="submit"
        className="h-5 w-4 px-0 rounded-md text-[5px] font-semibold bg-custom-red text-white "
      >
        Apply
      </button>
    </form>
  );
}