"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Home, PackageSearch, HelpCircle, ShoppingCart, Bell, BarChart3, Activity, Package, AlertTriangle } from "lucide-react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { AlertBell } from "@/components/alerts/alert-bell";

const loginPath = "/auth/login";
const registerPath = "/auth/register";
const navItems = [
  {
    name: "Home",
    link: "/",
    icon: <Home className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Items",
    link: "/items",
    icon: <PackageSearch className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Purchase Plan",
    link: "/purchase-plan",
    icon: <ShoppingCart className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Categories",
    link: "/categories",
    icon: <Package className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Performance",
    link: "/backtest",
    icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Model Info",
    link: "/model-transparency",
    icon: <Activity className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Data Quality",
    link: "/data-quality",
    icon: <AlertTriangle className="h-4 w-4 text-neutral-500" />,
  },
  {
    name: "Alerts",
    link: "/alerts",
    icon: <Bell className="h-4 w-4 text-neutral-500" />,
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
      actions={<NavAuthActions />}
      hideOnScroll={false}
    />
  );
}

function NavAuthActions() {
  return (
    <>
      <SignedOut>
        <Link
          href={loginPath}
          className="relative rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Sign in
          <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </Link>
      </SignedOut>
      <SignedIn>
        <AlertBell />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
              userButtonPopoverRootBox: "relative z-[100000]",
              userButtonPopoverCard: "relative z-[100000]",
              modalBackdrop: "z-[100000]",
              modalContent: "z-[100001]",
            },
          }}
          afterSignOutUrl="/"
          userProfileUrl="/manage"
          userProfileMode="navigation"
        />
      </SignedIn>
    </>
  );
}
