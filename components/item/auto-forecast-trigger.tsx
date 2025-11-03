"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { getItemForecast } from "@/lib/api/forecast";

interface AutoForecastTriggerProps {
  itemId: string;
  onComplete: () => void;
}

type Status = 
  | "idle"
  | "checking"
  | "triggering"
  | "waiting"
  | "polling"
  | "complete"
  | "error";

export function AutoForecastTrigger({ itemId, onComplete }: AutoForecastTriggerProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const triggerForecast = async () => {
    try {
      setStatus("triggering");
      setError(null);

      // The backend will automatically trigger the pipeline if PIPELINE_RUN_ON_DEMAND=true
      // We just need to make a request to the forecast endpoint
      const forecast = await getItemForecast(itemId);

      if (forecast && forecast.forecasts.length > 0) {
        setStatus("complete");
        setTimeout(() => {
          onComplete();
        }, 1000);
        return;
      }

      // If we get here but no forecasts, start waiting
      setStatus("waiting");
      setTimeout(() => {
        setStatus("polling");
        setPollCount(0);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      
      // If we get a 404, the backend is triggering the pipeline
      if (errorMessage.includes("(404)")) {
        setStatus("waiting");
        setTimeout(() => {
          setStatus("polling");
          setPollCount(0);
        }, 3000);
        return;
      }

      setError(errorMessage);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "polling") {
      const maxPolls = 20; // Poll for up to ~2 minutes
      if (pollCount >= maxPolls) {
        setError(
          "Forecast generation is taking longer than expected. Please refresh the page in a few minutes."
        );
        setStatus("error");
        return;
      }

      const timer = setTimeout(async () => {
        try {
          const forecast = await getItemForecast(itemId);

          if (forecast && forecast.forecasts.length > 0) {
            setStatus("complete");
            setTimeout(() => {
              onComplete();
            }, 1000);
          } else {
            setPollCount((prev) => prev + 1);
          }
        } catch (err) {
          // Still getting errors, keep polling
          setPollCount((prev) => prev + 1);
        }
      }, 6000); // Poll every 6 seconds

      return () => clearTimeout(timer);
    }
  }, [status, pollCount, itemId, onComplete]);

  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-neutral-900">Forecast unavailable</p>
              <p className="mt-1 text-sm text-neutral-600">
                This item does not yet have a champion forecast. The system can
                automatically generate a forecast for this item.
              </p>
            </div>
            <Button
              onClick={triggerForecast}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Forecast Now
            </Button>
          </div>
        );

      case "triggering":
        return (
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-semibold text-neutral-900">
                Initiating forecast generation...
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Checking if forecast pipeline needs to be triggered.
              </p>
            </div>
          </div>
        );

      case "waiting":
        return (
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-semibold text-neutral-900">
                Running forecasting pipeline...
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                The system is training models and generating forecasts. This may take
                1-2 minutes.
              </p>
            </div>
          </div>
        );

      case "polling":
        return (
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-semibold text-neutral-900">
                Waiting for forecast completion...
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Checking if forecast is ready... (attempt {pollCount + 1}/20)
              </p>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-neutral-900">Forecast generated!</p>
              <p className="mt-1 text-sm text-neutral-600">
                Refreshing page to display results...
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-neutral-900">
                  Unable to generate forecast
                </p>
                <p className="mt-1 text-sm text-neutral-600">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setStatus("idle");
                setError(null);
                setPollCount(0);
              }}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Alert className="border-blue-200 bg-blue-50/50">{renderContent()}</Alert>
  );
}

