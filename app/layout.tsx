import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "YETI - Grande Traversée",
  description: "Préparez votre GR20, TMB ou Camino avec précision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full bg-zinc-950">
      <body className={cn("h-full font-sans antialiased text-white", inter.variable)}>
        {/* On affiche juste le contenu, sans barre fixe au-dessus */}
        {children}
      </body>
    </html>
  );
}