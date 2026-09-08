import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WRECK — Your fitness, built around you",
    template: "%s · WRECK"
  },
  description:
    "WRECK is a personalized fitness operating system. It understands your goal, schedule, equipment, food culture and recovery, builds a plan around you, and adapts it to real life.",
  applicationName: "WRECK",
  authors: [{ name: "WRECK" }],
  keywords: [
    "fitness",
    "training",
    "nutrition",
    "adaptive",
    "personalized",
    "Indian food",
    "workout planner"
  ],
  openGraph: {
    title: "WRECK — Your fitness, built around you",
    description:
      "A personalized fitness operating system that plans, tracks and adapts around your real life.",
    siteName: "WRECK",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
