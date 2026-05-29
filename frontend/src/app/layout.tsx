import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "JalRakshak Health AI – Smart Health Surveillance & Disease Early Warning",
  description:
    "AI-powered health surveillance system for rural India. Predict disease outbreaks, visualize risk hotspots, and trigger early warnings to protect communities.",
  keywords: "health surveillance, disease outbreak, AI, rural health, India, early warning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-950 text-surface-100 min-h-screen">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
