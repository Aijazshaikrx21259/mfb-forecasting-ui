import { FullPageLoader } from "@/components/ui/full-page-loader";

export default function ItemsLoading() {
  return (
    <FullPageLoader
      title="Loading purchase planning items"
      message="Warming up the forecasting API and pulling /health status. Render’s free tier may pause the service between runs, so we’ll load your items as soon as it comes back with 200 OK."
    />
  );
}
