import { Suspense } from "react";
import { DelayedRenderWakeAlert } from "@/components/delayed-render-wake-alert";
import ItemsContent from "./items-content";

function ItemsWakeFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-12 pt-6">
      <DelayedRenderWakeAlert title="Warming up purchase planning workspace">
        <p className="text-sm text-neutral-600">
          The UI will load automatically once the forecasting API responds.
        </p>
      </DelayedRenderWakeAlert>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<ItemsWakeFallback />}>
      {/* Suspense allows the shell to render immediately while data loads */}
      <ItemsContent />
    </Suspense>
  );
}
