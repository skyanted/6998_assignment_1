import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Plans",
  description: "Turn an idea or a photo into an event plan. Discover events, vote for ones you’d join, and decide what to host.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
