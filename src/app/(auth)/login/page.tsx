import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic"; // AuthForm reads ?error= via useSearchParams

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
