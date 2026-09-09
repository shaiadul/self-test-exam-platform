import type { Metadata } from "next";
import { constructMetadata } from "../../../lib/seo/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Login to Account",
  description:
    "Log in to your Self Test account to access your practice mock tests, exams, and detailed performance scorecards.",
  canonicalPath: "/auth/login",
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
