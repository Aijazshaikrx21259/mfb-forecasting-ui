"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";

const loginPath = "/auth/login";
const registerPath = "/auth/register";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerk =
  publishableKey !== undefined &&
  publishableKey.startsWith("pk_") &&
  !publishableKey.includes("dummy");

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-3 px-6 py-3">
        {hasClerk ? <AuthenticatedLinks /> : <FallbackLinks />}
      </div>
    </header>
  );
}

function AuthenticatedLinks() {
  return (
    <>
      <SignedOut>
        <nav className="flex items-center gap-3">
          <Link
            href={loginPath}
            className="rounded-full border border-black/15 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
          >
            Login
          </Link>
          <Link
            href={registerPath}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Register
          </Link>
        </nav>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-3">
          <SignOutButton>
            <button className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white">
              Sign out
            </button>
          </SignOutButton>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </SignedIn>
    </>
  );
}

function FallbackLinks() {
  return (
    <nav className="flex items-center gap-3">
      <Link
        href={loginPath}
        className="rounded-full border border-black/15 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white"
      >
        Login
      </Link>
      <Link
        href={registerPath}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
      >
        Register
      </Link>
    </nav>
  );
}
