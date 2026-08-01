"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { signInWithGoogle, currentUser, isAdmin, authLoading } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Where to go after login. Only allow internal paths (avoid open redirect).
  const rawNext = params.get("next") || "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  // Already signed in (e.g. revisiting /login) — move on without a fresh popup.
  useEffect(() => {
    if (!authLoading && currentUser) router.push(isAdmin ? "/admin" : next);
  }, [authLoading, currentUser, isAdmin, next, router]);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const admin = await signInWithGoogle();
      router.push(admin ? "/admin" : next);
    } catch {
      setError("Login gagal. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col px-5 py-16">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand"><Icon name="package" size={22} color="#fff" /></span>
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="text-sm text-muted">Log in to track orders and manage your requests.</p>
      </div>
      <Card className="p-6">
        <Button className="h-11 w-full" onClick={submit} disabled={loading}>
          {loading ? "Signing in…" : "Continue with Google"}
        </Button>
        {error && <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
      </Card>
      <p className="mt-4 text-center text-sm text-muted">No account? Signing in with Google creates one automatically.</p>
    </main>
  );
}
