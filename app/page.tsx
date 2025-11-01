"use client";

import { HeroSection } from "@/components/ui/hero-section-with-smooth-bg-shader";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection
        title="Maryland Food Bank"
        highlightText="Purchase Forecasting"
        description="Streamlining food procurement operations with data-driven insights and intelligent forecasting tools."
        colors={["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#fd79a8"]}
        distortion={1.2}
        speed={0.8}
        veilOpacity="bg-white/10"
      >
        <SignedIn>
          <Link href="/dashboard">
            <button className="px-8 py-4 rounded-full border-4 bg-background/80 border-card text-base text-foreground hover:bg-background/90 transition-colors font-medium">
              Go to Dashboard
            </button>
          </Link>
        </SignedIn>
        <SignedOut>
          <Link href="/auth/login">
            <button className="px-8 py-4 rounded-full border-4 bg-background/80 border-card text-base text-foreground hover:bg-background/90 transition-colors font-medium">
              Sign In to Continue
            </button>
          </Link>
        </SignedOut>
      </HeroSection>

      {/* Footer */}
      <footer className="w-full border-t bg-white/50 backdrop-blur mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Maryland Food Bank – Purchase Forecasting
            </p>
            <p className="text-xs text-gray-500">
              Last update: {formattedDate} • For internal use
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="/guide" className="hover:text-gray-900">How to use this page</a>
            <a href="/contact" className="hover:text-gray-900">Contact procurement</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
