"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ItemSearchForm() {
  const router = useRouter();
  const [itemId, setItemId] = React.useState("");

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = itemId.trim();
      if (!trimmed) {
        return;
      }

      router.push(`/items/${encodeURIComponent(trimmed)}`);
    },
    [itemId, router]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <label
        htmlFor="item-id"
        className="text-sm font-medium text-neutral-700 sm:w-44"
      >
        Go directly to item
      </label>
      <div className="flex flex-1 items-center gap-2">
        <Input
          id="item-id"
          name="item-id"
          placeholder="e.g. ITEM-12345"
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
          autoComplete="off"
          aria-label="Item identifier"
        />
        <Button type="submit" size="sm" disabled={!itemId.trim()}>
          Open
        </Button>
      </div>
    </form>
  );
}
