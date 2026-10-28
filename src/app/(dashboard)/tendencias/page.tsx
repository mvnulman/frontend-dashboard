import { Suspense } from "react";
import { connection } from "next/server";

import { PageSkeleton } from "@/components/shell/page-skeleton";
import { TrendsClient } from "@/components/tendencias/trends-client";
import { getDashboardData } from "@/lib/live";

export const metadata = {
  title: "Tendências",
};

export default function TrendsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TrendsData />
    </Suspense>
  );
}

async function TrendsData() {
  await connection();
  const data = await getDashboardData();

  return <TrendsClient data={data} />;
}
