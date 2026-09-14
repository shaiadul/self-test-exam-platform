import type { Metadata } from "next";
import { cookies } from "next/headers";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { constructMetadata } from "../../lib/seo/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Dashboard",
  description: "Self Test Student and Educator Portal",
  noIndex: true,
  canonicalPath: "/dashboard",
});

function decodeRole(token?: string): string {
  if (!token) return "student";
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    return typeof json.role === "string" ? json.role : "student";
  } catch {
    return "student";
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = decodeRole(cookieStore.get("token")?.value);

  return (
    <DashboardLayoutClient initialRole={role}>{children}</DashboardLayoutClient>
  );
}
