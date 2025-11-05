import { Loader2 } from "lucide-react";

type FullPageLoaderProps = {
  title?: string;
  message?: string;
};

export function FullPageLoader({
  title = "Loading forecasting workspace",
  message = "Checking the forecasting API health endpoint. Because the backend runs on Render’s free tier, it can take a moment to wake up. Your data will appear as soon as the service responds.",
}: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <h1 className="mt-6 text-xl font-semibold text-neutral-900">{title}</h1>
      <p className="mt-3 max-w-md text-sm text-neutral-600">{message}</p>
    </div>
  );
}
