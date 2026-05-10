import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { SHARKDESK_LOGO_URL } from "@/lib/branding";
import { sharkdeskClerkAppearance } from "@/lib/clerk-appearance";

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

/** After sign-in / sign-up / magic link — absolute URL on prod helps Clerk send users back to your deployment. */
function clerkAfterAuthRedirectUrls(): {
  signInFallbackRedirectUrl: string;
  signUpFallbackRedirectUrl: string;
} {
  const explicitIn =
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL?.trim();
  const explicitUp =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL?.trim();
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const derived =
    base && base.startsWith("http") ? `${base}/projects` : "/projects";

  return {
    signInFallbackRedirectUrl: explicitIn || derived,
    signUpFallbackRedirectUrl: explicitUp || derived,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const redirects = clerkAfterAuthRedirectUrls();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="h-full text-text-primary overflow-hidden">
        <ClerkProvider
          appearance={sharkdeskClerkAppearance}
          signInFallbackRedirectUrl={redirects.signInFallbackRedirectUrl}
          signUpFallbackRedirectUrl={redirects.signUpFallbackRedirectUrl}
        >
          <AppShell>{children}</AppShell>
        </ClerkProvider>
      </body>
    </html>
  );
}
