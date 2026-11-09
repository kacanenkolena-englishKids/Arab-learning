import type { Metadata } from "next";
import "@fontsource/noto-naskh-arabic/arabic-400.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Arabic in Riyadh — Саудовский арабский с нуля",
  description:
    "Практический курс разговорного саудовского арабского для русскоговорящих.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
