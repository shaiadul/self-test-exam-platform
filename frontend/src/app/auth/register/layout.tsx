import type { Metadata } from "next";
import { constructMetadata } from "../../../lib/seo/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Create Free Student Account",
  description:
    "Join Self Test for free to start taking timed mock exams, practicing subject question packs, and evaluating your readiness with instant analytics.",
  canonicalPath: "/auth/register",
});

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
