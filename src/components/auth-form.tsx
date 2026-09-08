"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions";
import { Button, FieldError, Input, Label } from "@/components/ui/primitives";
import { Wordmark } from "@/components/wordmark";

/**
 * Shared auth form for sign-in and registration. Real validation, real error
 * states, real loading state. On success it routes into the app, where the app
 * layout decides between onboarding and dashboard.
 */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    setFields({});

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result =
      mode === "register"
        ? await registerAction({
            email,
            password,
            displayName: String(formData.get("displayName") ?? "")
          })
        : await loginAction({ email, password });

    if (result.ok) {
      router.push("/app");
      router.refresh();
      return;
    }
    setError(result.error);
    setFields(result.fields ?? {});
    setPending(false);
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <Wordmark size="lg" />
      <h1 className="mt-8 font-display text-display-md text-bone">
        {mode === "register" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-bone-dim">
        {mode === "register"
          ? "A minute to sign up, then we build your WRECK."
          : "Sign in to pick up where you left off."}
      </p>

      <form action={onSubmit} className="mt-8 space-y-5" noValidate>
        {mode === "register" && (
          <div>
            <Label htmlFor="displayName">What should we call you</Label>
            <Input id="displayName" name="displayName" autoComplete="name" placeholder="First name" required />
            <FieldError>{fields.displayName}</FieldError>
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          <FieldError>{fields.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
            required
          />
          <FieldError>{fields.password}</FieldError>
        </div>

        {error && (
          <p className="border border-clay/40 bg-clay/10 px-3 py-2 text-sm text-clay rounded-sm" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "One moment" : mode === "register" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-bone-dim">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-ember-hi hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to WRECK?{" "}
            <Link href="/register" className="text-ember-hi hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
      <p className="mt-8 text-xs text-bone-faint">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline hover:text-bone-dim">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-bone-dim">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
