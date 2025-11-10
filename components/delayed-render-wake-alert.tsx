"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RenderWakeAlert } from "@/components/render-wake-alert";

type DelayedRenderWakeAlertProps = {
  delayMs?: number;
  children?: ReactNode;
} & React.ComponentProps<typeof RenderWakeAlert>;

export function DelayedRenderWakeAlert({
  delayMs = 10_000,
  children,
  ...alertProps
}: DelayedRenderWakeAlertProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!show) {
    return null;
  }

  if (children) {
    return (
      <div className="space-y-3">
        <RenderWakeAlert {...alertProps} />
        {children}
      </div>
    );
  }

  return <RenderWakeAlert {...alertProps} />;
}
