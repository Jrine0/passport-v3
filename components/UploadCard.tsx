"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploadUrl(data?.metadata?.url ?? null);
    setLoading(false);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Upload passport asset</h3>
        <p className="text-sm text-muted-foreground">
          Attach an image, PDF, or metadata file that will be linked from the passport record.
        </p>
      </div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm"
      />
      <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
        {loading ? "Uploading..." : "Upload asset"}
      </Button>
      {uploadUrl && (
        <p className="break-words text-sm text-emerald-700">
          Uploaded: {" "}
          <a href={uploadUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {uploadUrl}
          </a>
        </p>
      )}
    </div>
  );
}
