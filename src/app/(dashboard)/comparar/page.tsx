import { Suspense } from "react";
import { connection } from "next/server";

import { CompareClient } from "@/components/compare/compare-client";
import { PageSkeleton } from "@/components/shell/page-skeleton";
import { getDashboardData } from "@/lib/live";

export const metadata = {
  title: "Comparar",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CompareData />
    </Suspense>
  );
}

async function CompareData() {
  await connection();
  const data = await getDashboardData();

  return <CompareClient data={data} />;
}
