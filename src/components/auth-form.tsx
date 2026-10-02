"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions";
import { Button, FieldError, Input, Label } from "@/components/ui/primitives";
import { Wordmark } from "@/components/wordmark";

const OAUTH_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't complete. Please try again.",
  google_unconfigured: "Google sign-in isn't set up yet."
};

/**
 * Shared auth form for sign-in and registration. Real validation, real error
 * states, real loading state. On success it routes into the app, where the app
 * layout decides between onboarding and dashboard.
 */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const oauthError = useSearchParams().get("error");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    oauthError ? OAUTH_ERRORS[oauthError] ?? "Sign-in failed. Please try again." : null
  );
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

      <a
        href="/api/auth/google"
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-sm border border-ink-line bg-ink-raise px-4 py-3 text-sm font-bold text-bone transition-colors hover:border-bone/30"
      >
        <GoogleG />
        Continue with Google
      </a>

      <div className="my-6 flex items-center gap-3 text-xs text-bone-faint">
        <span className="h-px flex-1 bg-ink-line" />
        or
        <span className="h-px flex-1 bg-ink-line" />
      </div>

      <form action={onSubmit} className="space-y-5" noValidate>
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

/** Google's four-colour "G" mark (official brand colours). */
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.6 13.2l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z" />
      <path fill="#FBBC05" d="M10.5 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3l-7.9-6.1C1 16.7 0 20.2 0 24s1 7.3 2.6 10.4l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.3-4.6 2.1-7.9 2.1-6.3 0-11.6-3.8-13.5-9.3l-7.9 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
