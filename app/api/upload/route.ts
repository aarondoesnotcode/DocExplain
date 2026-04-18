import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: "https://api.z.ai/api/anthropic",
});

const ANALYSIS_PROMPT = `Analyze this UK official document and provide a structured response. The document could be a TfL fine, council letter, eviction notice, or similar official UK document.

Return your response as a valid JSON object with exactly these fields:
- summary: A clear, simple English summary of what the document is about
- key_points: Array of 3-5 key points from the document
- urgency: Either "low", "medium", or "high" based on how urgent the matter is
- deadline: Any deadline mentioned in the document, or "No deadline specified" if none
- actions: Array of 3-5 specific actions the person can take
- recommended_action: The single most recommended action to take
- response_letter: A formal, well-written letter they can use to respond to the document

Important guidelines:
- Use simple, clear language throughout
- Be empathetic and supportive
- For deadlines, be specific about dates mentioned
- The response letter should be professional and ready to use
- Always consider that the reader may have limited literacy or may not be a native English speaker

Respond ONLY with the JSON object, no additional text.`;

function parseAnalysisResponse(responseText: string) {
  const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim();
  const analysisResult = JSON.parse(cleanedResponse);

  const requiredFields = [
    "summary",
    "key_points",
    "urgency",
    "deadline",
    "actions",
    "recommended_action",
    "response_letter",
  ];
  for (const field of requiredFields) {
    if (!(field in analysisResult)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (!["low", "medium", "high"].includes(analysisResult.urgency)) {
    analysisResult.urgency = "medium";
  }

  return analysisResult;
}

async function analyzeDocument(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{
  summary: string;
  key_points: string[];
  urgency: "low" | "medium" | "high";
  deadline: string;
  actions: string[];
  recommended_action: string;
  response_letter: string;
}> {
  const base64Data = fileBuffer.toString("base64");

  const fileContent =
    mimeType === "application/pdf"
      ? {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: base64Data,
          },
        }
      : {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: mimeType as "image/jpeg" | "image/png",
            data: base64Data,
          },
        };

  const message = await client.messages.create({
    model: "glm-5.1",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [fileContent, { type: "text", text: ANALYSIS_PROMPT }],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  return parseAnalysisResponse(textBlock.text);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
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

    let analysisResult;
    try {
      analysisResult = await analyzeDocument(fileBuffer, file.type);
    } catch (error) {
      console.error("AI analysis failed:", error);
      return NextResponse.json(
        { error: "Failed to analyze document. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Upload endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
