import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

function analyzeText(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const sentenceLengths = sentences.map(
    (s) => s.split(/\s+/).filter(Boolean).length
  );

  const avgSentenceLength =
    sentenceLengths.reduce((a, b) => a + b, 0) /
    Math.max(sentenceLengths.length, 1);

  const variance =
    sentenceLengths.reduce(
      (sum, len) => sum + Math.pow(len - avgSentenceLength, 2),
      0
    ) / Math.max(sentenceLengths.length, 1);

  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const lexicalDiversity = uniqueWords / Math.max(words.length, 1);

  // Heuristic AI score
  let aiScore = 50;

  if (lexicalDiversity > 0.45) aiScore -= 10;
  if (variance > 40) aiScore -= 10;
  if (avgSentenceLength > 14 && avgSentenceLength < 28) aiScore -= 5;

  aiScore = Math.max(5, Math.min(95, Math.round(aiScore)));

  // Heuristic originality estimate
  let originalityScore = Math.round(lexicalDiversity * 100);
  originalityScore = Math.max(50, Math.min(98, originalityScore));

  return {
    aiDetection: {
      score: aiScore,
      label:
        aiScore < 30
          ? "Low AI-like pattern"
          : aiScore < 60
          ? "Mixed pattern"
          : "More formulaic pattern",
      note:
        "This is a heuristic writing analysis, not a definitive AI detector.",
    },
    similarity: {
      score: 100 - originalityScore,
      originalityScore,
      note:
        "This is an originality estimate based on writing diversity, not a Turnitin-style plagiarism check.",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY environment variable is missing." },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const body = await req.json();
    const question = body.question || "";
    const rules = body.rules || "";

    const prompt = `
Write a complete academic assignment answer in formal third-person language.

Writing Objectives:
- Produce natural, polished academic writing that reads like authentic student work.
- Address the assignment question directly and comprehensively.
- Follow the marking rubric and all instructions exactly.
- Use original analysis, logical reasoning, and topic-specific examples.
- Avoid generic statements and repetitive wording.
- Vary sentence length and paragraph structure naturally.
- Use a clear introduction, well-organized body sections, and a conclusion.
- Use relevant headings and subheadings.
- Integrate APA 7 in-text citations and a reference list when appropriate.
- Highlight important insights using bold text.

Formatting Requirements:
- Main headings: suitable for Calibri 16 pt, bold, dark blue.
- Subheadings: suitable for Calibri 14 pt, bold, dark green.
- Body text: suitable for Calibri 11 pt, black.

Assignment Question:
${question}

Instructions and Marking Criteria:
${rules}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.35,
    });

    const answer =
      response.choices?.[0]?.message?.content || "No response.";

    const report = analyzeText(answer);

    return NextResponse.json({
      answer,
      report,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate answer.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
