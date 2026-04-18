import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocExplain - Understand Your Documents",
  description: "Upload UK official documents and get plain English explanations, key points, and actions to take.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}