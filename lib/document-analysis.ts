import { createWorker } from "tesseract.js";

import type { DocumentAnalysis } from "@/types/document";

const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4";
const TEXT_MODEL_NAME = process.env.ZAI_MODEL || "glm-5-turbo";
const VISION_MODEL_NAME = process.env.ZAI_VISION_MODEL || "glm-5v-turbo";
const GOOGLE_VISION_API_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const TEXT_NOT_VISIBLE = "Not clearly visible on the document";

type UploadMimeType = "image/jpeg" | "image/png" | "application/pdf";

type StructuredDocumentFacts = {
  document_type: string;
  issuer: string;
  notice_title: string;
  reference_number: string;
  vehicle_registration: string;
  notice_date: string;
  event_date: string;
  deadline: string;
  amount_due: string;
  discounted_amount: string;
  location: string;
  recipient_name: string;
  recipient_address: string;
  next_steps: string[];
  confidence_notes: string[];
  evidence_snippets: string[];
};

type OcrResult = {
  source: "zai-ocr" | "google-vision" | "tesseract" | "none";
  text: string;
};

type GoogleVisionResponse = {
  responses?: Array<{
    error?: {
      message?: string;
    };
    fullTextAnnotation?: {
      text?: string;
    };
    textAnnotations?: Array<{
      description?: string;
    }>;
  }>;
};

type JsonRecord = Record<string, unknown>;
type OcrWorker = Awaited<ReturnType<typeof createWorker>>;

type ChatMessageContentPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: {
        url: string;
      };
    };

type ChatMessage = {
  role: "system" | "user";
  content: string | ChatMessageContentPart[];
};

type ChatCompletionResponse = {
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type LayoutParsingResponse = {
  error?: {
    message?: string;
  };
  md_results?: string;
};

let workerPromise: Promise<OcrWorker> | null = null;
const MIN_TEXT_CONFIDENCE_LENGTH = 40;

const FACT_EXTRACTION_PROMPT = `You are extracting facts from a UK official document such as a Penalty Charge Notice, TfL notice, council letter, eviction notice, or similar.

Work carefully and never guess. Only use details that are visible in the document image or in the OCR transcript provided. If OCR is missing or incomplete, inspect the image itself carefully before deciding a field is unclear.

Return a valid JSON object with exactly these fields:
- document_type
- issuer
- notice_title
- reference_number
- vehicle_registration
- notice_date
- event_date
- deadline
- amount_due
- discounted_amount
- location
- recipient_name
- recipient_address
- next_steps
- confidence_notes
- evidence_snippets

Rules:
- If a value is missing or uncertain, use "${TEXT_NOT_VISIBLE}".
- Dates and money amounts must match the document wording as closely as possible.
- next_steps must be an array of 2 to 5 short actions explicitly supported by the document.
- confidence_notes must be an array of 1 to 4 short notes about anything unclear, cropped, blurred, or contradictory.
- evidence_snippets must be an array of 3 to 8 short verbatim snippets copied from the visible document or OCR transcript.
- Do not add any keys outside this schema.

Respond with JSON only.`;

const FINAL_ANALYSIS_PROMPT = `Analyze this UK official document and provide a structured response.

You may receive up to THREE sources of information:
1. Structured facts extracted from the document using a prior vision pass.
2. Raw OCR transcript from the document image.
3. The original image itself.

CRITICAL ACCURACY RULES - you MUST follow these:
- Use all available sources together.
- If the OCR transcript clearly contains a date, amount, reference number, penalty type, or location, prefer the OCR wording for that field.
- If OCR is missing, weak, or incomplete, rely on the structured facts and the document image rather than saying the document is unreadable.
- Only say the document cannot be analysed if the image itself is genuinely unreadable and the structured facts are also mostly unclear.
- NEVER invent, guess, or assume any date, amount, reference number, or penalty charge type.
- If something is uncertain, say it is unclear instead of refusing the whole analysis.

Return your response as a valid JSON object with exactly these fields:
- summary: A clear, simple English summary of what the document is about
- key_points: Array of 3-5 key points from the document
- urgency: Either "low", "medium", or "high" based on how urgent the matter is
- deadline: Any deadline mentioned in the document, or "No deadline specified" if none
- actions: Array of 3-5 specific actions the person can take
- recommended_action: The single most recommended action to take
- response_letter: A formal, well-written letter they can use to respond to the document

Important guidelines:
- Cross-check every key detail across the available sources before including it.
- If a fact is unclear or missing, say so plainly instead of guessing.
- Use simple, clear language throughout.
- Be empathetic and supportive.
- For deadlines, be specific about dates mentioned.
- The response letter must reference the correct dates, amounts, and reference numbers whenever they are visible in any trusted source.
- The response letter should be professional and ready to use.
- Always consider that the reader may have limited literacy or may not be a native English speaker.
- If the document looks like a Penalty Charge Notice or similar fine, recommend evidence-gathering and checking appeal rights where appropriate.

Respond ONLY with the JSON object, no additional text.`;

function buildFileContent(fileBuffer: Buffer, mimeType: UploadMimeType) {
  return {
    type: "image_url" as const,
    image_url: {
      url: `data:${mimeType};base64,${fileBuffer.toString("base64")}`,
    },
  };
}

function countVisibleFactFields(facts: StructuredDocumentFacts) {
  const factValues = [
    facts.document_type,
    facts.issuer,
    facts.notice_title,
    facts.reference_number,
    facts.vehicle_registration,
    facts.notice_date,
    facts.event_date,
    facts.deadline,
    facts.amount_due,
    facts.discounted_amount,
    facts.location,
    facts.recipient_name,
    facts.recipient_address,
  ];

  return factValues.filter((value) => value && value !== TEXT_NOT_VISIBLE).length;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function truncateForPrompt(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n...[truncated for length]`;
}

function extractJsonSubstring(value: string) {
  let depth = 0;
  let start = -1;
  let inString = false;
  let isEscaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === "\\" && !isEscaped) {
      isEscaped = true;
      continue;
    }

    if (character === '"' && !isEscaped) {
      inString = !inString;
    }

    if (!inString) {
      if (character === "{") {
        if (depth === 0) {
          start = index;
        }
        depth += 1;
      } else if (character === "}") {
        depth -= 1;

        if (depth === 0 && start !== -1) {
          return value.slice(start, index + 1);
        }
      }
    }

    isEscaped = false;
  }

  return value.trim();
}

function parseJsonObject(responseText: string): JsonRecord {
  const cleaned = responseText.replace(/```json\s*|```\s*/gi, "").trim();
  const candidate = extractJsonSubstring(cleaned);
  const parsed = JSON.parse(candidate);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Model response was not a JSON object");
  }

  return parsed as JsonRecord;
}

function normalizeString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeStringArray(value: unknown, fallback: string[], minItems: number, maxItems: number) {
  const items = Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (items.length === 0) {
    return fallback.slice(0, maxItems);
  }

  return items
    .slice(0, maxItems)
    .concat(fallback)
    .slice(0, Math.max(minItems, Math.min(items.length, maxItems)));
}

function normalizeUrgency(value: unknown): "low" | "medium" | "high" {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

function normalizeFacts(payload: JsonRecord): StructuredDocumentFacts {
  return {
    document_type: normalizeString(payload.document_type, TEXT_NOT_VISIBLE),
    issuer: normalizeString(payload.issuer, TEXT_NOT_VISIBLE),
    notice_title: normalizeString(payload.notice_title, TEXT_NOT_VISIBLE),
    reference_number: normalizeString(payload.reference_number, TEXT_NOT_VISIBLE),
    vehicle_registration: normalizeString(payload.vehicle_registration, TEXT_NOT_VISIBLE),
    notice_date: normalizeString(payload.notice_date, TEXT_NOT_VISIBLE),
    event_date: normalizeString(payload.event_date, TEXT_NOT_VISIBLE),
    deadline: normalizeString(payload.deadline, TEXT_NOT_VISIBLE),
    amount_due: normalizeString(payload.amount_due, TEXT_NOT_VISIBLE),
    discounted_amount: normalizeString(payload.discounted_amount, TEXT_NOT_VISIBLE),
    location: normalizeString(payload.location, TEXT_NOT_VISIBLE),
    recipient_name: normalizeString(payload.recipient_name, TEXT_NOT_VISIBLE),
    recipient_address: normalizeString(payload.recipient_address, TEXT_NOT_VISIBLE),
    next_steps: normalizeStringArray(
      payload.next_steps,
      ["Review the notice carefully.", "Keep a copy of the document and any evidence."],
      2,
      5
    ),
    confidence_notes: normalizeStringArray(
      payload.confidence_notes,
      ["Some parts of the document may be hard to read."],
      1,
      4
    ),
    evidence_snippets: normalizeStringArray(
      payload.evidence_snippets,
      ["No reliable text snippet could be extracted."],
      1,
      8
    ),
  };
}

function normalizeAnalysis(payload: JsonRecord): DocumentAnalysis {
  return {
    summary: normalizeString(payload.summary, "This document could not be summarized reliably."),
    key_points: normalizeStringArray(
      payload.key_points,
      [
        "Review the document carefully.",
        "Keep a copy of the notice and any supporting evidence.",
        "Get advice if anything important is unclear.",
      ],
      3,
      5
    ),
    urgency: normalizeUrgency(payload.urgency),
    deadline: normalizeString(payload.deadline, "No deadline specified"),
    actions: normalizeStringArray(
      payload.actions,
      [
        "Read the document carefully from start to finish.",
        "Keep a copy of the notice and any related evidence.",
        "Contact Citizens Advice or another adviser if you need help.",
      ],
      3,
      5
    ),
    recommended_action: normalizeString(
      payload.recommended_action,
      "Review the notice carefully and seek advice before responding."
    ),
    response_letter: normalizeString(
      payload.response_letter,
      `Dear Sir or Madam,\n\nI am writing about the notice I received. Some details on the document are not fully clear from the copy I have, so I would be grateful if you could confirm the reference number, the deadline, and what steps I should take next.\n\nPlease also let me know how I can respond or appeal if that option is available.\n\nYours faithfully,\n[Your Name]`
    ),
  };
}

async function getOcrWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 1, {
      workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
      corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core-simd-lstm.wasm.js",
    });
  }

  return workerPromise;
}

async function extractTextWithTesseract(fileBuffer: Buffer) {
  const worker = await getOcrWorker();
  const result = await worker.recognize(fileBuffer, {
    rotateAuto: true,
  });

  return normalizeWhitespace(result.data.text || "");
}

async function extractTextWithGoogleVision(fileBuffer: Buffer) {
  if (!GOOGLE_VISION_API_KEY) {
    return "";
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: fileBuffer.toString("base64"),
            },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Vision OCR failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GoogleVisionResponse;
  const firstResponse = payload.responses?.[0];

  if (firstResponse?.error?.message) {
    throw new Error(firstResponse.error.message);
  }

  const text =
    firstResponse?.fullTextAnnotation?.text ||
    firstResponse?.textAnnotations?.[0]?.description ||
    "";

  return normalizeWhitespace(text);
}

async function extractTextWithZaiLayoutParsing(fileBuffer: Buffer, mimeType: UploadMimeType) {
  console.log("[ZAI-OCR] API key set:", !!ZAI_API_KEY);
  console.log("[ZAI-OCR] Base URL:", ZAI_BASE_URL);
  console.log("[ZAI-OCR] MIME type:", mimeType);
  console.log("[ZAI-OCR] File buffer size:", fileBuffer.length);

  if (!ZAI_API_KEY) {
    return "";
  }

  const dataUri = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

  const response = await fetch(`${ZAI_BASE_URL}/layout_parsing`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "glm-ocr",
      file: dataUri,
    }),
  });

  const responseText = await response.text();
  console.log("[ZAI-OCR] HTTP status:", response.status);
  console.log("[ZAI-OCR] Raw response (first 500 chars):", responseText.substring(0, 500));

  if (!response.ok) {
    throw new Error(`Z.ai layout parsing failed with status ${response.status}: ${responseText.substring(0, 200)}`);
  }

  const payload = JSON.parse(responseText) as LayoutParsingResponse;
  console.log("[ZAI-OCR] md_results length:", (payload.md_results || "").length);

  return normalizeWhitespace(payload.md_results || "");
}

async function extractDocumentText(fileBuffer: Buffer, mimeType: UploadMimeType): Promise<OcrResult> {
  try {
    const zaiOcrText = await extractTextWithZaiLayoutParsing(fileBuffer, mimeType);
    if (zaiOcrText.length >= MIN_TEXT_CONFIDENCE_LENGTH) {
      return {
        source: "zai-ocr",
        text: zaiOcrText,
      };
    }
  } catch (error) {
    console.error("Z.ai layout parsing OCR failed:", error);
  }

  if (mimeType !== "application/pdf" && GOOGLE_VISION_API_KEY) {
    try {
      const googleVisionText = await extractTextWithGoogleVision(fileBuffer);
      if (googleVisionText.length >= MIN_TEXT_CONFIDENCE_LENGTH) {
        return {
          source: "google-vision",
          text: googleVisionText,
        };
      }
    } catch (error) {
      console.error("Google Vision OCR failed, falling back to Tesseract:", error);
    }
  }

  if (mimeType !== "application/pdf") {
    try {
      const tesseractText = await extractTextWithTesseract(fileBuffer);
      if (tesseractText) {
        return {
          source: "tesseract",
          text: tesseractText,
        };
      }
    } catch (error) {
      console.error("Tesseract OCR failed:", error);
    }
  }

  return { source: "none", text: "" };
}

async function runChatCompletion(messages: ChatMessage[], model: string, maxTokens: number) {
  if (!ZAI_API_KEY) {
    throw new Error("ZAI_API_KEY is not configured");
  }

  const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.1,
      stream: false,
      response_format: {
        type: "json_object",
      },
    }),
  });

  const payload = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message || `Z.ai request failed with status ${response.status}`);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No text response from AI");
  }

  return content;
}

async function extractStructuredFacts(
  fileBuffer: Buffer,
  mimeType: UploadMimeType,
  ocrResult: OcrResult
) {
  const promptSections = [
    FACT_EXTRACTION_PROMPT,
    `OCR source: ${ocrResult.source}`,
    ocrResult.text
      ? `OCR transcript:\n${truncateForPrompt(ocrResult.text, 12000)}`
      : "OCR transcript: No OCR transcript was available.",
  ];

  const useTextFirst = mimeType === "application/pdf" || ocrResult.text.length >= MIN_TEXT_CONFIDENCE_LENGTH;

  const messages: ChatMessage[] =
    useTextFirst
      ? [
          {
            role: "user",
            content: promptSections.join("\n\n"),
          },
        ]
      : [
          {
            role: "user",
            content: [buildFileContent(fileBuffer, mimeType), { type: "text", text: promptSections.join("\n\n") }],
          },
        ];

  const responseText = await runChatCompletion(
    messages,
    useTextFirst ? TEXT_MODEL_NAME : VISION_MODEL_NAME,
    2500
  );

  return normalizeFacts(parseJsonObject(responseText));
}

async function generateDocumentAnalysis(
  fileBuffer: Buffer,
  mimeType: UploadMimeType,
  facts: StructuredDocumentFacts,
  ocrResult: OcrResult
): Promise<DocumentAnalysis> {
  const promptSections = [
    FINAL_ANALYSIS_PROMPT,
    `OCR source: ${ocrResult.source}`,
    "Use the following structured facts:",
    JSON.stringify(facts, null, 2),
    ocrResult.text
      ? `OCR transcript for reference:\n${truncateForPrompt(ocrResult.text, 12000)}`
      : "OCR transcript for reference: None available.",
  ];

  const useTextFirst =
    mimeType === "application/pdf" ||
    ocrResult.text.length >= MIN_TEXT_CONFIDENCE_LENGTH ||
    countVisibleFactFields(facts) >= 3;

  const messages: ChatMessage[] =
    useTextFirst
      ? [
          {
            role: "user",
            content: promptSections.join("\n\n"),
          },
        ]
      : [
          {
            role: "user",
            content: [buildFileContent(fileBuffer, mimeType), { type: "text", text: promptSections.join("\n\n") }],
          },
        ];

  const responseText = await runChatCompletion(
    messages,
    useTextFirst ? TEXT_MODEL_NAME : VISION_MODEL_NAME,
    4096
  );

  return normalizeAnalysis(parseJsonObject(responseText));
}

export async function analyzeDocument(fileBuffer: Buffer, mimeType: UploadMimeType): Promise<DocumentAnalysis> {
  const ocrResult = await extractDocumentText(fileBuffer, mimeType);
  console.log("[OCR] source:", ocrResult.source, "| length:", ocrResult.text.length);
  console.log("[OCR] text preview:", ocrResult.text.substring(0, 500));
  console.log("[OCR] useTextFirst would be:", ocrResult.text.length >= MIN_TEXT_CONFIDENCE_LENGTH);

  const facts = await extractStructuredFacts(fileBuffer, mimeType, ocrResult);
  console.log("[FACTS] visible fields:", countVisibleFactFields(facts), "/ 13");
  console.log("[FACTS] document_type:", facts.document_type);
  console.log("[FACTS] reference_number:", facts.reference_number);
  console.log("[FACTS] deadline:", facts.deadline);
  console.log("[FACTS] amount_due:", facts.amount_due);

  return generateDocumentAnalysis(fileBuffer, mimeType, facts, ocrResult);
}
