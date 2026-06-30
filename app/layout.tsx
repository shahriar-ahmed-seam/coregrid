import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXTAUTH_URL || "https://coregrid.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CoreGrid — The Autonomous Enterprise System",
    template: "%s · CoreGrid",
  },
  description:
    "CoreGrid unifies HR, CRM, inventory, finance and projects into one intelligent workspace, with private on-device AI that turns operational data into decisions.",
  keywords: [
    "ERP",
    "enterprise resource planning",
    "CRM",
    "HR software",
    "inventory management",
    "finance",
    "project management",
    "business analytics",
    "local AI",
    "Ollama",
    "Next.js",
    "CoreGrid",
  ],
  authors: [{ name: "Shahriar Ahmed" }],
  creator: "Shahriar Ahmed",
  applicationName: "CoreGrid",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "CoreGrid — The Autonomous Enterprise System",
    description:
      "Run your entire company on one intelligent grid. HR, CRM, inventory, finance and projects — unified, with private AI built in.",
    siteName: "CoreGrid",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoreGrid — The Autonomous Enterprise System",
    description:
      "Run your entire company on one intelligent grid, with private AI built in.",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
