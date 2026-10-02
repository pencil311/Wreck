import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic"; // AuthForm reads ?error= via useSearchParams

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
