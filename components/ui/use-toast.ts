"use client";

// Simple toast stub for build compatibility
export function useToast() {
  const toast = (props: any) => {
    console.log("Toast:", props);
  };

  return { toast };
}
