"use client";

import { useCallback } from "react";
// import { useToast } from "@/components/ui/use-toast";

/**
 * Hook for handling errors with toast notifications
 */
export function useToastError() {
  // Simple console-based implementation
  const toast = (props: any) => console.log("Toast:", props);

  const showError = useCallback(
    (error: unknown, defaultMessage: string = "An error occurred") => {
      let message = defaultMessage;
      let description: string | undefined;

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      } else if (error && typeof error === "object" && "message" in error) {
        message = String(error.message);
        if ("detail" in error) {
          description = String(error.detail);
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });

      // Log to console for debugging
      console.error("Error:", error);
    },
    [toast]
  );

  const showSuccess = useCallback(
    (message: string, description?: string) => {
      toast({
        title: "Success",
        description: message,
      });
    },
    [toast]
  );

  const showWarning = useCallback(
    (message: string, description?: string) => {
      toast({
        title: "Warning",
        description: message,
        variant: "default",
      });
    },
    [toast]
  );

  const showInfo = useCallback(
    (message: string, description?: string) => {
      toast({
        title: "Info",
        description: message,
      });
    },
    [toast]
  );

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

/**
 * Hook for async operations with error handling
 */
export function useAsyncError() {
  const { showError, showSuccess } = useToastError();

  const handleAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (result: T) => void;
        onError?: (error: unknown) => void;
      }
    ): Promise<T | null> => {
      try {
        const result = await asyncFn();
        
        if (options?.successMessage) {
          showSuccess(options.successMessage);
        }
        
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (error) {
        showError(error, options?.errorMessage);
        
        if (options?.onError) {
          options.onError(error);
        }
        
        return null;
      }
    },
    [showError, showSuccess]
  );

  return { handleAsync };
}
