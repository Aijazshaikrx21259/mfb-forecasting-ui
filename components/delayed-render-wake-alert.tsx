"use client";

import { useEffect, useState } from "react";
import { RenderWakeAlert } from "@/components/render-wake-alert";

type DelayedRenderWakeAlertProps = {
  delayMs?: number;
} & React.ComponentProps<typeof RenderWakeAlert>;

export function DelayedRenderWakeAlert({
  delayMs = 10_000,
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

  return <RenderWakeAlert {...alertProps} />;
}
