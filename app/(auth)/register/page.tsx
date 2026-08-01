"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const { signInWithGoogle, currentUser, isAdmin, authLoading } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && currentUser) router.push(isAdmin ? "/admin" : "/profile");
  }, [authLoading, currentUser, isAdmin, router]);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("Sign up gagal. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-md flex-col px-5 py-16">
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand"><Icon name="package" size={22} color="#fff" /></span>
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="text-sm text-muted">Sign up to start requesting items and tracking hauls.</p>
      </div>
      <Card className="p-6">
        <Button className="h-11 w-full" onClick={submit} disabled={loading}>
          {loading ? "Redirecting to Google…" : "Continue with Google"}
        </Button>
        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
      </Card>
      <p className="mt-4 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-bold text-brand">Log in</Link></p>
    </main>
  );
}
