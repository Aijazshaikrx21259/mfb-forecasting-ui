import type { Metadata } from "next";
import { RedirectToSignIn, SignedIn, SignedOut, UserProfile } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Manage account | MFB Purchase Forecasting",
  description:
    "Update your profile, security preferences, and connected accounts for the Maryland Food Bank purchase forecasting workspace.",
};

const managePath = "/manage";
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerk =
  publishableKey !== undefined &&
  publishableKey.startsWith("pk_") &&
  !publishableKey.includes("dummy");

export default function ManageAccountPage() {
  if (!hasClerk) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-6">
        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">
            Account management unavailable
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Configure Clerk credentials (see <code>.env.example</code>) to enable the profile settings page locally.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6">
      <SignedIn>
        <UserProfile path={managePath} routing="path" />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={managePath} />
      </SignedOut>
    </div>
  );
}
