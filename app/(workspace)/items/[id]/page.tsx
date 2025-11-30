import Link from "next/link";
import { notFound } from "next/navigation";

import { loadItemInsight } from "@/lib/item-insights";
import { Alert } from "@/components/ui/alert";
import { PageContent } from "./page-content";

interface ItemPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { itemId: rawItemId } = await params;
  const itemId = decodeURIComponent(rawItemId);

  let insightError: Error | null = null;
  let insight = null;

  try {
    insight = await loadItemInsight(itemId);
  } catch (error) {
    insightError = error as Error;
  }

  if (!insight) {
    if (insightError) {
      return (
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-12 pt-6">
          <nav className="text-sm text-neutral-500" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link
                  href="/items"
                  className="text-neutral-500 underline-offset-4 hover:text-neutral-800 hover:underline"
                >
                  Items
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="font-medium text-neutral-900">{itemId}</span>
              </li>
            </ol>
          </nav>
          <Alert>
            <p className="font-semibold">Unable to load item insight</p>
            <p className="mt-1 text-sm">
              {insightError.message ?? "An unexpected error occurred while contacting the forecasting API."}
            </p>
          </Alert>
        </div>
      );
    }
    notFound();
  }

  return <PageContent itemId={itemId} initialInsight={insight} />;
}
