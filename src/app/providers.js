'use client';
import { MoneyProvider } from '@/lib/money-context';
import { SlotJiggleProvider } from '@/lib/slot-jiggle-context';
import { ThemeProvider } from "next-themes"


export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
      <MoneyProvider>
        <SlotJiggleProvider>{children}</SlotJiggleProvider>
      </MoneyProvider>
    </ThemeProvider>
    );
}