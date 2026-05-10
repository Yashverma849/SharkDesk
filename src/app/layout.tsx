import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { SHARKDESK_LOGO_URL } from "@/lib/branding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shark Desk",
  description: "Minimal internal tool for project tracking",
  icons: {
    icon: SHARKDESK_LOGO_URL,
    apple: SHARKDESK_LOGO_URL,
  },
};

/** Hides phone UI in embedded Clerk components (India has limited Clerk phone/SMS support). */
const clerkAppearance = {
  elements: {
    userProfilePage__phoneNumbers: {
      display: "none",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="h-full text-text-primary overflow-hidden">
        <ClerkProvider
          appearance={clerkAppearance}
          signInFallbackRedirectUrl="/projects"
          signUpFallbackRedirectUrl="/projects"
        >
          <AppShell>{children}</AppShell>
        </ClerkProvider>
      </body>
    </html>
  );
}
