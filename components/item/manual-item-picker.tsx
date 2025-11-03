"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ParsedItem {
  id: string;
  label: string;
}

const STORAGE_KEY = "mfb-manual-item-ids";

function parseInput(value: string): ParsedItem[] {
  // Split by newlines or commas, trim whitespace, remove empty strings
  const rawIds = value
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  // Use Set to automatically remove duplicates
  const uniqueIds = Array.from(new Set(rawIds));

  return uniqueIds.map((id) => ({ id, label: id }));
}

function loadFromStorage(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveToStorage(value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (value.trim()) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function ManualItemPicker() {
  const [inputValue, setInputValue] = React.useState("");
  const [isMounted, setIsMounted] = React.useState(false);
  const [duplicatesRemoved, setDuplicatesRemoved] = React.useState(0);

  // Load from localStorage on mount
  React.useEffect(() => {
    setIsMounted(true);
    const stored = loadFromStorage();
    setInputValue(stored);
  }, []);

  const parsedItems = React.useMemo(() => parseInput(inputValue), [inputValue]);

  // Save to localStorage whenever input changes
  React.useEffect(() => {
    if (isMounted) {
      saveToStorage(inputValue);
    }
  }, [inputValue, isMounted]);

  // Detect and count duplicates
  React.useEffect(() => {
    if (!inputValue.trim()) {
      setDuplicatesRemoved(0);
      return;
    }

    const rawIds = inputValue
      .split(/[\n,]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    const uniqueCount = new Set(rawIds).size;
    const totalCount = rawIds.length;
    const duplicates = totalCount - uniqueCount;

    setDuplicatesRemoved(duplicates);
  }, [inputValue]);

  const handleClear = () => {
    setInputValue("");
    setDuplicatesRemoved(0);
  };

  const handleRemoveItem = (itemIdToRemove: string) => {
    const rawIds = inputValue
      .split(/[\n,]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    const filtered = rawIds.filter((id) => id !== itemIdToRemove);
    setInputValue(filtered.join("\n"));
  };

  // Don't render buttons until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Paste item IDs you already know
            </h2>
            <p className="text-xs text-neutral-500">
              Enter one per line (or comma separated). We'll create quick links so
              you can jump straight to their item pages.
            </p>
          </div>
          <Textarea
            value=""
            onChange={() => {}}
            placeholder={`P-352101\nP-906104`}
            rows={3}
            aria-label="List of item identifiers"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Paste item IDs you already know
            </h2>
            <p className="text-xs text-neutral-500">
              Enter one per line (or comma separated). We'll create quick links so
              you can jump straight to their item pages.
            </p>
          </div>
          {parsedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="shrink-0 text-xs text-neutral-500 hover:text-neutral-900"
            >
              Clear all
            </Button>
          )}
        </div>
        <Textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={`P-352101\nP-906104`}
          rows={3}
          aria-label="List of item identifiers"
          className="font-mono text-sm"
        />
        {duplicatesRemoved > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <span className="font-semibold">{duplicatesRemoved}</span> duplicate
            {duplicatesRemoved === 1 ? "" : "s"} removed automatically. Only unique
            IDs are shown below.
          </div>
        )}
        {parsedItems.length > 0 ? (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-600">
                {parsedItems.length} unique item{parsedItems.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {parsedItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative inline-flex items-center gap-1"
                >
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="pr-8 font-semibold"
                  >
                    <Link href={`/items/${encodeURIComponent(item.id)}`}>
                      {item.label}
                    </Link>
                  </Button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveItem(item.id);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 opacity-0 transition-all hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100"
                    aria-label={`Remove ${item.id}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
