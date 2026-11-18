import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Tamil, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NilamTrace | நிலம் டிரேஸ் - Sovereign Title Engine for Rural Land Loans",
  description:
    "Zero-Literacy Voice Intake, Multi-Modal Title Document X-Ray, Deterministic Unit Math, and Sovereign VAO Stamp Gate for Tamil Nadu Farmland Loans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ta"
      className={`${plusJakarta.variable} ${notoSansTamil.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#F4F7F5] text-[#111827] flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
