import type { Metadata } from "next";
import { constructMetadata } from "../../../lib/seo/metadata";

export const metadata: Metadata = constructMetadata({
  title: "Reset Account Password",
  description:
    "Reset your Self Test account password securely to regain access to your exam preparations and mock tests.",
  canonicalPath: "/auth/forgot-password",
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
