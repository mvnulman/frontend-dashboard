import { Suspense } from "react";
import { connection } from "next/server";

import { RadarClient } from "@/components/radar/radar-client";
import { PageSkeleton } from "@/components/shell/page-skeleton";
import { getDashboardData } from "@/lib/live";

export const metadata = {
  title: "Radar",
};

export default function RadarPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RadarData />
    </Suspense>
  );
}

async function RadarData() {
  await connection();
  const data = await getDashboardData();

  return <RadarClient data={data} />;
}
