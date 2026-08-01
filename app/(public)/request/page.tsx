"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RequestPage() {
  const { submitRequest } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", url: "", qty: "1", variations: "", expected: "" });
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setImages((p) => [...p, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    submitRequest({
      product_name_or_desc: form.name, product_url: form.url || null,
      uploaded_image_urls: images.length ? images : null, quantity: Math.max(1, Number(form.qty) || 1),
      variations: form.variations
    });
    setSubmitted(true);
  };

  if (submitted) return (
    <main className="mx-auto max-w-lg px-5 py-24 text-center">
      <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><Icon name="check" size={30} className="text-green-600" /></span>
      <h1 className="text-2xl font-extrabold">Request submitted!</h1>
      <p className="mt-2 text-muted">We&apos;ll review your item and send a transparent quote to your dashboard and WhatsApp within a few hours.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/dashboard"><Button>Go to My Orders</Button></Link>
        <Link href="/catalog"><Button variant="outline">Browse Catalog</Button></Link>
      </div>
    </main>
  );

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Can&apos;t find it? Request it!</h1>
        <p className="text-sm text-muted">Paste a link or upload a photo/screenshot. We&apos;ll hunt it down overseas and send you a quote.</p>
      </div>
      <Card className="p-6">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <Field label="Product name / description" required>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nike Air Max 1 'Patta'" className="input" />
          </Field>
          <Field label="Product URL (optional if photo provided)">
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="input" />
          </Field>
          <div>
            <label className="mb-1.5 block text-sm font-bold">Reference photos / screenshots</label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-edge/15 py-8 text-center hover:border-brand">
              <Icon name="image-plus" size={26} className="text-faint" />
              <span className="text-sm text-muted">Click to upload multiple images</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
            </label>
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, x) => x !== i))} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"><Icon name="x" size={13} color="#fff" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity"><input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} onBlur={() => setForm((f) => ({ ...f, qty: String(Math.max(1, Number(f.qty) || 1)) }))} className="input" /></Field>
            <Field label="Expected price (optional)"><input value={form.expected} onChange={(e) => setForm({ ...form, expected: e.target.value })} placeholder="e.g. ¥12,000" className="input" /></Field>
          </div>
          <Field label="Size / color variations">
            <input value={form.variations} onChange={(e) => setForm({ ...form, variations: e.target.value })} placeholder="e.g. Size M, Color Red" className="input" />
          </Field>
          <Button type="submit" className="h-12">Submit Request <Icon name="arrow-right" size={17} color="#fff" /></Button>
        </form>
      </Card>
      <style jsx global>{`
        .input { width:100%; height:44px; border-radius:12px; border:1.5px solid rgba(0,0,0,.12); padding:0 14px; font-size:14px; background:#fff; outline:none; }
        .input:focus { border-color:#2563EB; }
      `}</style>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold">{label}{required && <span className="text-brand"> *</span>}</label>
      {children}
    </div>
  );
}
