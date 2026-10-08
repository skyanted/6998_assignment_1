import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Plans",
  description: "AI activity proposals for Columbia students. Discover ideas, vote, and plan activities together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
