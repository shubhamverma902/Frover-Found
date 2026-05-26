import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import StoreProvider from "@/components/StoreProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forever Found — Wedding & Event Planner Across India",
  description: "Forever Found crafts unforgettable weddings and events across India. From intimate ceremonies to grand celebrations, we plan every detail perfectly.",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html
    lang="en"
    className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    suppressHydrationWarning
  >
    <body className="min-h-full flex flex-col">
      <StoreProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </StoreProvider>
    </body>
  </html>
);

export default RootLayout;
