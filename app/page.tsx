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
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maryland Food Bank</h3>
              <p className="text-gray-600 text-sm mt-1">
                Fighting hunger across Maryland
              </p>
            </div>
            </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-xs font-semibold text-gray-700 mb-3">Office Locations:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
              <div>
                <p className="font-medium text-gray-700">Baltimore Office</p>
                <p>2200 Halethorpe Farms Rd</p>
                <p>Baltimore, MD 21227</p>
                <p>(410) 737-8282</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Eastern Shore</p>
                <p>28500 Owens Branch Rd</p>
                <p>Salisbury, MD 21801</p>
                <p>(410) 742-0050</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Western Branch</p>
                <p>220 McRand Court</p>
                <p>Hagerstown, MD 21740</p>
                <p>(410) 737-8282</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="text-center text-sm text-gray-500">
              © 2025 Maryland Food Bank is a 501(c)(3) • All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
