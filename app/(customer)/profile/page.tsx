"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileForm />
    </Suspense>
  );
}

function ProfileForm() {
  const { currentUser, authLoading, updateProfile } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const needsAddress = params.get("needAddress") === "1";

  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp_number ?? "");
  const [address, setAddress] = useState(currentUser?.shipping_address ?? "");
  const [saved, setSaved] = useState(false);

  if (authLoading) return <main className="mx-auto max-w-md px-5 py-24 text-center text-muted">Loading…</main>;
  if (!currentUser) return <main className="mx-auto max-w-md px-5 py-24 text-center"><h1 className="text-2xl font-extrabold">Please log in</h1><p className="mt-1 text-muted">Log in to view your profile and store credit.</p><Link href="/login?next=/profile"><Button className="mt-4">Log In</Button></Link></main>;

  const save = () => {
    updateProfile({ whatsapp_number: whatsapp, shipping_address: address });
    setSaved(true);
    if (next && next.startsWith("/") && !next.startsWith("//") && address.trim()) {
      router.push(next);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Profile</h1>
      <Card className="mb-4 flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          {currentUser.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={currentUser.photo_url} alt={currentUser.full_name} className="h-12 w-12 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-extrabold text-brand-700">{currentUser.full_name[0]}</span>
          )}
          <div>
            <div className="font-bold">{currentUser.full_name}</div>
            <div className="text-sm text-muted">{currentUser.email}</div>
          </div>
        </div>
      </Card>
      <Card className="p-5">
        {needsAddress && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            <Icon name="triangle-alert" size={16} /> Isi alamat pengiriman dulu sebelum checkout.
          </div>
        )}
        <div className="mb-3 font-bold">Shipping details</div>
        <label className="mb-1 block text-xs font-semibold text-muted">WhatsApp number</label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 6281234567890" className="profile-input mb-3" />
        <label className="mb-1 block text-xs font-semibold text-muted">Shipping address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Alamat lengkap penerima" rows={3} className="profile-input mb-3" />
        <Button onClick={save}>Save</Button>
        {saved && <span className="ml-3 text-sm font-semibold text-emerald-600">Saved ✓</span>}
      </Card>
      <style jsx global>{`.profile-input{width:100%;border-radius:12px;border:1.5px solid rgba(0,0,0,.12);padding:10px 14px;font-size:14px;outline:none}.profile-input:focus{border-color:#2563EB}`}</style>
    </main>
  );
}
