import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lineage",
  description:
    "An interactive map of contemplative traditions and a directory of teachers and centers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
