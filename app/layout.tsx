import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Layout/Navbar";
import { ViewModeProvider } from "@/lib/context/ViewModeContext";
import { WelcomeModal } from "@/components/Modals/WelcomeModal";
import { GuidedTourModal } from "@/components/Modals/GuidedTourModal";
import { HelpModal } from "@/components/Modals/HelpModal";
import { WhyModal } from "@/components/Modals/WhyModal";

export const metadata: Metadata = {
  title: "TACTIX AI | AI-Assisted Mission Planning",
  description: "Deterministic environmental simulation, multi-objective COA evaluation, and explainable risk analysis grounded in real geospatial data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-slate-100 antialiased tactical-grid-bg flex flex-col">
        <ViewModeProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          {/* Global Interactive Modals */}
          <WelcomeModal />
          <GuidedTourModal />
          <HelpModal />
          <WhyModal />
        </ViewModeProvider>
      </body>
    </html>
  );
}
