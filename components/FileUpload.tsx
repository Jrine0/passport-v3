"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" />
      <Button onClick={handleUpload} disabled={!file} className="w-full">
        Upload passport asset
      </Button>
      {result && (
        <pre className="rounded-lg bg-muted p-3 text-sm">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
