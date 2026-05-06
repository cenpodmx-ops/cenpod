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
    default: "CENPOD — Productos de Podología Profesional",
  },
  description:
    "Tienda en línea de productos de podología profesional. Equipamiento, insumos y herramientas para podólogos.",
  keywords: [
    "podología",
    "productos podología",
    "equipamiento podólogo",
    "insumos podología",
    "CENPOD",
    "podología profesional",
  ],
  authors: [{ name: "CENPOD" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "CENPOD — Productos de Podología Profesional",
    description:
      "Tienda en línea de productos de podología profesional. Equipamiento, insumos y herramientas para podólogos.",
    siteName: "CENPOD",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "CENPOD — Productos de Podología Profesional",
    description:
      "Tienda en línea de productos de podología profesional.",
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
