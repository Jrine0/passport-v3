import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileName = `${randomUUID()}-${safeName}`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  const publicUrl = `/uploads/${fileName}`;

  try {
    return NextResponse.json(
      {
        uploadId: fileName,
        url: publicUrl,
        metadata: {
          url: publicUrl,
          uploadId: fileName,
          fileName: file.name,
        },
      },
      { status: 200 },
    );

  } catch (err: any) {
    console.error("Tusky upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
