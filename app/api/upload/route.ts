import { NextRequest, NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function extractTextWithGoogleVision(fileBuffer: Buffer): Promise<string> {
  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.documentTextDetection({
      image: { content: fileBuffer },
    });

    const fullTextAnnotation = result.fullTextAnnotation;
    return fullTextAnnotation?.text || "";
  } catch (error) {
    console.error("Google Vision API error:", error);
    throw new Error("Failed to extract text using Google Vision API");
  }
}

async function extractTextWithTesseract(fileBuffer: Buffer): Promise<string> {
  try {
    const Tesseract = await import("tesseract.js");
    const { data: { text } } = await Tesseract.recognize(
      fileBuffer,
      "eng",
      {
        logger: (m: any) => console.log(m),
      }
    );
    return text;
  } catch (error) {
    console.error("Tesseract error:", error);
    throw new Error("Failed to extract text using Tesseract");
  }
}

async function extractText(fileBuffer: Buffer): Promise<string> {
  // Try Google Vision API first
  if (process.env.GOOGLE_CLOUD_API_KEY) {
    try {
      const text = await extractTextWithGoogleVision(fileBuffer);
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (error) {
      console.warn("Google Vision failed, falling back to Tesseract");
    }
  }

  // Fallback to Tesseract
  return await extractTextWithTesseract(fileBuffer);
}

async function analyzeDocumentWithAI(text: string): Promise<{
  summary: string;
  key_points: string[];
  urgency: "low" | "medium" | "high";
  deadline: string;
  actions: string[];
  recommended_action: string;
  response_letter: string;
}> {
  const prompt = `Analyze this UK official document text and provide a structured response. The document could be a TfL fine, council letter, eviction notice, or similar official UK document.

Text to analyze:
${text}

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

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();

  // Clean and parse JSON response
  const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim();
  const analysisResult = JSON.parse(cleanedResponse);

  // Validate the response has all required fields
  const requiredFields = ["summary", "key_points", "urgency", "deadline", "actions", "recommended_action", "response_letter"];
  for (const field of requiredFields) {
    if (!(field in analysisResult)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate urgency values
  if (!["low", "medium", "high"].includes(analysisResult.urgency)) {
    analysisResult.urgency = "medium"; // Default fallback
  }

  return analysisResult;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPG, PNG, or PDF" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Extract text using OCR
    let extractedText: string;
    try {
      extractedText = await extractText(fileBuffer);
    } catch (error) {
      console.error("OCR failed:", error);
      return NextResponse.json(
        { error: "Failed to extract text from document. Please try again." },
        { status: 500 }
      );
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: "Could not extract enough text from the document. Please try a clearer image." },
        { status: 400 }
      );
    }

    // Analyze document with AI
    let analysisResult;
    try {
      analysisResult = await analyzeDocumentWithAI(extractedText);
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