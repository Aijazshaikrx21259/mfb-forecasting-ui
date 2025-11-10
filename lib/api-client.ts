const DEFAULT_BASE_URL = "http://127.0.0.1:8000/api";
const DEFAULT_API_KEY = "change-me";
const DEFAULT_TIMEOUT_MS = 15000;

export const RENDER_API_DOCS_URL =
  "https://mfb-forecasting-api.onrender.com/docs";

export function getRenderWakeHint(): string {
  return `Open ${RENDER_API_DOCS_URL} in a separate tab to wake the forecasting API (Render pauses free-tier services when idle). Wait for the docs to load, then return here and refresh.`;
}

function getApiBaseUrl(): string {
  const envValue =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    DEFAULT_BASE_URL;
  return envValue.endsWith("/") ? envValue.slice(0, -1) : envValue;
}

function getApiKey(): string {
  return (
    process.env.API_KEY ??
    process.env.NEXT_PUBLIC_API_KEY ??
    DEFAULT_API_KEY
  );
}

function getApiTimeoutMs(): number {
  const raw =
    process.env.API_TIMEOUT_MS ??
    process.env.NEXT_PUBLIC_API_TIMEOUT_MS ??
    "";
  const parsed = Number.parseInt(raw, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_TIMEOUT_MS;
}

export type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  timeoutMs?: number;
};

export async function apiFetch<T>(
  path: string,
  {
    headers,
    timeoutMs,
    signal: externalSignal,
    ...options
  }: ApiRequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const apiKey = getApiKey();
  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> || {}),
  };
  if (apiKey) {
    finalHeaders["X-API-Key"] = apiKey;
  }

  const controller = new AbortController();
  let externalAbortHandler: (() => void) | undefined;
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalAbortHandler = () => controller.abort();
      externalSignal.addEventListener("abort", externalAbortHandler, {
        once: true,
      });
    }
  }

  const effectiveTimeoutMs =
    typeof timeoutMs === "number" ? timeoutMs : getApiTimeoutMs();

  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (Number.isFinite(effectiveTimeoutMs) && effectiveTimeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, effectiveTimeoutMs);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders as HeadersInit,
      cache: options?.cache ?? "no-store",
      next: options?.next,
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const payload = await response.json();
        if (payload && typeof payload.detail === "string") {
          detail = payload.detail;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(buildErrorMessage(response.status, detail));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (isAbortError(error) && timedOut) {
      throw new Error(
        `The forecasting API is still waking up. ${getRenderWakeHint()}`
      );
    }

    if (isNetworkError(error)) {
      throw new Error(
        `Unable to reach the forecasting API. ${getRenderWakeHint()}`
      );
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (externalSignal && externalAbortHandler) {
      externalSignal.removeEventListener("abort", externalAbortHandler);
    }
  }
}

function buildErrorMessage(status: number, detail: string): string {
  const base = `API request failed (${status}): ${detail}`;
  return shouldSuggestRenderHint(status)
    ? `${base} ${getRenderWakeHint()}`
    : base;
}

function shouldSuggestRenderHint(status: number): boolean {
  return status >= 500;
}

function isAbortError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

function isNetworkError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("network request failed")
  );
}
