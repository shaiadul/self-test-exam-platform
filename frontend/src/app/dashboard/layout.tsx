import type { Metadata } from "next";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { constructMetadata } from "../../lib/seo/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Dashboard",
  description: "Self Test Student and Educator Portal",
  noIndex: true,
  canonicalPath: "/dashboard",
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
