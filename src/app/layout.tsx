import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";
import { CartDrawer } from "@/components/layout/cart-drawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PROVENTURE MARKETPLACE | Multi-Vendor Commerce Platform",
  description:
    "Curated multi-vendor e-commerce marketplace featuring independent artisans, premium electronics, lifestyle apparel, and direct seller storefronts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
        <CartDrawer />
        <ToastContainer />
      </body>
    </html>
  );
}
