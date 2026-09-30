"use client";

import { usePathname } from "next/navigation";
import { PageContainer } from "../../components/common/PageContainer";
import DashboardSkeleton from "../../components/common/DashboardSkeleton";
import PageSkeleton from "../../components/common/PageSkeleton";

export default function Loading() {
  const pathname = usePathname();
  const isDashboardHome = pathname === "/dashboard";

  if (isDashboardHome) {
    return (
      <PageContainer>
        <DashboardSkeleton showHero={true} />
      </PageContainer>
    );
  }

  return <PageSkeleton />;
}
