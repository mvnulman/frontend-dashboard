import { Suspense } from "react";

import { TrendsClient } from "@/components/tendencias/trends-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Tendências",
};

function TrendsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-[122px] w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[290px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <Suspense fallback={<TrendsSkeleton />}>
      <TrendsClient />
    </Suspense>
  );
}
