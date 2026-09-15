import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchecTuto",
  description: "EchecTuto — migration cloud progressive",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
