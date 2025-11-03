const DEFAULT_BASE_URL = "http://127.0.0.1:8000/api";
const DEFAULT_API_KEY = "change-me";

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

export type ApiRequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export async function apiFetch<T>(
  path: string,
  { headers, ...options }: ApiRequestOptions = {}
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

  const response = await fetch(url, {
    ...options,
    headers: finalHeaders as HeadersInit,
    cache: options?.cache ?? "no-store",
    next: options?.next,
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
    throw new Error(`API request failed (${response.status}): ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
