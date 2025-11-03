"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ParsedItem {
  id: string;
  label: string;
}

function parseInput(value: string): ParsedItem[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,]+/)
        .map((part) => part.trim())
        .filter(Boolean)
    )
  ).map((id) => ({ id, label: id }));
}

export function ManualItemPicker() {
  const [inputValue, setInputValue] = React.useState("");
  const parsedItems = React.useMemo(() => parseInput(inputValue), [inputValue]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            Paste item IDs you already know
          </h2>
          <p className="text-xs text-neutral-500">
            Enter one per line (or comma separated). We’ll create quick links so
            you can jump straight to their item pages.
          </p>
        </div>
        <Textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder={`ITEM-12345\nITEM-67890`}
          rows={3}
          aria-label="List of item identifiers"
        />
        {parsedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {parsedItems.map((item) => (
              <Button
                key={item.id}
                asChild
                variant="secondary"
                size="sm"
                className="font-semibold"
              >
                <Link href={`/items/${encodeURIComponent(item.id)}`}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
