import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CENPOD",
    default: "CENPOD — CENTRO PODOLÓGICO",
  },
  description:
    "CENTRO PODOLÓGICO — Tienda en línea de instrumentos, insumos y equipamiento profesional para podólogos.",
  keywords: [
    "podología",
    "productos podología",
    "equipamiento podólogo",
    "insumos podología",
    "CENPOD",
    "CENTRO PODOLÓGICO",
  ],
  authors: [{ name: "CENPOD" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CENPOD — CENTRO PODOLÓGICO",
    description:
      "CENTRO PODOLÓGICO — Tienda en línea de instrumentos, insumos y equipamiento profesional para podólogos.",
    siteName: "CENPOD",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "CENPOD — CENTRO PODOLÓGICO",
    description:
      "CENTRO PODOLÓGICO — Tienda en línea de instrumentos, insumos y equipamiento profesional.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
