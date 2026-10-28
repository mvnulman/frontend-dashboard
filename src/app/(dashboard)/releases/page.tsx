import { Suspense } from "react";
import { connection } from "next/server";

import { ReleasesClient } from "@/components/releases/releases-client";
import { PageSkeleton } from "@/components/shell/page-skeleton";
import { getDashboardData } from "@/lib/live";

export const metadata = {
  title: "Releases",
};

export default function ReleasesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ReleasesData />
    </Suspense>
  );
}

async function ReleasesData() {
  await connection();
  const data = await getDashboardData();

  return <ReleasesClient data={data} />;
}
