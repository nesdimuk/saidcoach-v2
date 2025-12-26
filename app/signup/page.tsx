import { Suspense } from "react";
import SignupPageClient from "@/components/auth/SignupPageClient";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageClient />
    </Suspense>
  );
}
