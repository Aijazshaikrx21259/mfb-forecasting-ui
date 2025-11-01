"use client";

import type { ReactNode } from "react";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type FloatingNavItem = {
  name: string;
  link: string;
  icon?: ReactNode;
};

interface FloatingNavProps {
  navItems: FloatingNavItem[];
  className?: string;
  logo?: ReactNode;
  actions?: ReactNode;
}

export function FloatingNav({
  navItems,
  className,
  logo,
  actions,
}: FloatingNavProps) {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current !== "number") {
      return;
    }

    const previous = scrollYProgress.getPrevious();
    const direction =
      typeof previous === "number" ? current - previous : undefined;

    // Always show navbar at top of page
    if (scrollYProgress.get() < 0.05) {
      setVisible(true);
      return;
    }

    // Hide on scroll down, show on scroll up
    if (direction !== undefined) {
      setVisible(direction < 0);
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.9
        }}
        transition={{
          duration: 0.2,
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        className={cn(
          "fixed inset-x-0 top-10 z-[9999] mx-auto flex max-w-fit items-center space-x-4 rounded-full border border-transparent bg-white/95 pl-8 pr-2 py-2 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] backdrop-blur",
          className,
        )}
      >
        {logo && (
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {logo}
          </motion.div>
        )}

        {navItems.map((navItem, idx) => (
          <motion.div
            key={`${navItem.name}-${idx}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <Link
              href={navItem.link}
              className={cn(
                "relative flex items-center gap-2 text-sm font-medium text-neutral-700 transition-colors",
                "hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950",
              )}
            >
              {navItem.icon && (
                <motion.span
                  className="block sm:hidden"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.3 }}
                >
                  {navItem.icon}
                </motion.span>
              )}
              <span className="hidden text-sm sm:block">{navItem.name}</span>
            </Link>
          </motion.div>
        ))}

        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            {actions}
          </motion.div>
        )}

        {!actions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <button className="relative rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white">
              <span>Login</span>
              <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
