import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wandr.ai — AI-Powered Travel Planning",
  description:
    "Plan your perfect trip with AI-generated itineraries, budgets, and hotel recommendations. Your intelligent travel companion.",
  keywords: ["travel", "AI", "itinerary", "trip planning", "budget travel"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-void text-bright font-body antialiased">
        <Providers>
          <AuthGuard>{children}</AuthGuard>
        </Providers>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1A2744',
              color: '#E8F4FF',
              border: '1px solid #3D5070',
            }
          }}
        />
      </body>
    </html>
  );
}
