import { FullPageLoader } from "@/components/ui/full-page-loader";

export default function WorkspaceLoading() {
  return (
    <FullPageLoader
      title="Loading forecasting workspace"
      message="Waking the forecasting API by polling /health. Render’s free tier pauses the service when idle, so data appears as soon as it returns 200 OK."
    />
  );
}
