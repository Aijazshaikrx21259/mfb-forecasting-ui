import { Suspense } from "react";
import { RenderWakeAlert } from "@/components/render-wake-alert";
import ItemsContent from "./items-content";

function ItemsWakeFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 pb-12 pt-6">
      <RenderWakeAlert title="Warming up purchase planning workspace" />
      <p className="text-sm text-neutral-600">
        The UI will load automatically once the forecasting API responds.
      </p>
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
