import { NextRequest, NextResponse } from "next/server";

import { analyzeDocument } from "@/lib/document-analysis";

const allowedTypes = ["image/jpeg", "image/png", "application/pdf"] as const;

type AllowedFileType = (typeof allowedTypes)[number];

function isAllowedFileType(fileType: string): fileType is AllowedFileType {
  return allowedTypes.includes(fileType as AllowedFileType);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPG, PNG, or PDF" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
      const analysisResult = await analyzeDocument(fileBuffer, file.type);
      return NextResponse.json(analysisResult);
    } catch (error) {
      console.error("AI analysis failed:", error);
      return NextResponse.json(
        { error: "Failed to analyze document. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
