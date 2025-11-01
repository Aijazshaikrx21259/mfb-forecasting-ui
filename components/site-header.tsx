"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Home, Info, MessageSquare } from "lucide-react";
import { FloatingNav } from "@/components/ui/floating-navbar";

const loginPath = "/auth/login";
const registerPath = "/auth/register";
const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <Home className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "About",
    link: "/about",
    icon: <Info className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Contact",
    link: "/contact",
    icon: <MessageSquare className="h-4 w-4 text-neutral-500" />,
  },
];

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasClerk =
  publishableKey !== undefined &&
  publishableKey.startsWith("pk_") &&
  !publishableKey.includes("dummy");

export function SiteHeader() {
  const logo = (
    <Link href="/" aria-label="Maryland Food Bank home">
      <Image
        src="/logo.svg"
        alt="Maryland Food Bank"
        width={148}
        height={54}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );

  return (
    <FloatingNav
      navItems={navItems}
      logo={logo}
      actions={
        hasClerk ? (
          <NavAuthActions />
        ) : (
          <FallbackActions />
        )
      }
    />
  );
}

function NavAuthActions() {
  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-3">
          <Link
            href={registerPath}
            className="relative rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            Create account
            <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </Link>
          <Link
            href={loginPath}
            className="relative rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            Login
            <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </Link>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
          afterSignOutUrl="/"
        />
      </SignedIn>
    </>
  );
}

function FallbackActions() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={registerPath}
        className="relative rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        Create account
        <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </Link>
      <Link
        href={loginPath}
        className="relative rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
      >
        Login
        <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </Link>
    </div>
  );
}
