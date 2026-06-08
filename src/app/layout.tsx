import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

import { getCurrentLocale, getDictionary } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import BottomNav from "@/components/BottomNav";
import { ToastProvider, ToastContainer } from "@/components/Toast";
import CartSync from "@/components/CartSync";

export const metadata: Metadata = {
  title: "Feira Livre Digital - O frescor da feira na sua casa",
  description: "Conectando você aos melhores produtores regionais com a conveniência do digital. Compre frutas, verduras e orgânicos frescos direto do feirante.",
  applicationName: "Feira.Casa",
  themeColor: "#125d30",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Feira.Casa",
  },
  openGraph: {
    title: "Feira Livre Digital - O frescor na sua casa",
    description: "Compre produtos frescos diretamente dos feirantes locais, sem intermediários. Entrega rápida e com qualidade de feira.",
    url: "https://mktplacefeira.casa",
    siteName: "Feira.Casa",
    images: [
      {
        url: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1200&auto=format&fit=crop", // placeholder bonito de feira
        width: 1200,
        height: 630,
        alt: "Banca de Feira Livre",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  const dictionary = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{ fontFamily: 'var(--font-be-vietnam), sans-serif' }}
        suppressHydrationWarning
      >
        <ToastProvider>
          <I18nProvider initialLocale={locale} initialDictionary={dictionary}>
            {children}
            <BottomNav />
            <CartSync />
          </I18nProvider>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
