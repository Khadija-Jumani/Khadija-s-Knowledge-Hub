import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Note from "@/lib/models/Note";
import { extractTextFromUrl } from "@/lib/ai-utils";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const maxDuration = 60; // Allow more time for PDF fetching and Gemini
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { noteId, subject, notes } = await req.json();

        if (!noteId && (!subject || !notes)) {
            return NextResponse.json({ error: "Missing noteId or subject/notes" }, { status: 400 });
        }

        let fileText = "";
        let promptSubject = "";
        let promptTitleContext = "";

        if (subject && notes && Array.isArray(notes)) {
            // Subject Quiz Mode: extract from multiple notes
            const notesToProcess = notes.slice(0, 4); // Limit to 4 to avoid timeouts/token limits

            console.log(`Analyzing ${notesToProcess.length} files for subject: ${subject}`);

            const extractionPromises = notesToProcess.map(async (n: any) => {
                if (n.downloadUrl) {
                    return await extractTextFromUrl(n.downloadUrl, n.title);
                }
                return "";
            });

            const texts = await Promise.all(extractionPromises);
            fileText = texts.join("\n\n---\n\n");
            promptSubject = subject;
            promptTitleContext = "Various Subject Materials";

            console.log(`Extracted total ${fileText.length} characters from subject documents. Preview:`, fileText.slice(0, 150));
            if (!fileText || fileText.trim().length < 50) {
                return NextResponse.json({ error: `Could not extract enough text from the subject documents to generate a quiz. Captured length: ${fileText?.length || 0}. Preview: ${fileText?.slice(0, 50)}` }, { status: 400 });
            }

        } else {
            // Single Note Mode
            await connectToDB();
            const note = await Note.findById(noteId);

            if (!note) {
                return NextResponse.json({ error: "Note not found" }, { status: 404 });
            }

            if (!note.downloadUrl) {
                return NextResponse.json({ error: "Note does not have a valid download URL" }, { status: 400 });
            }

            console.log("Analyzing file:", note.title);
            try {
                fileText = await extractTextFromUrl(note.downloadUrl, note.title);
            } catch (extractorError: any) {
                return NextResponse.json({ error: `Extraction Debug: ${extractorError.message || extractorError}` }, { status: 400 });
            }
            promptSubject = note.subject;
            promptTitleContext = note.title;

            console.log(`Extracted text preview:`, fileText.slice(0, 150));
            if (!fileText || fileText.trim().length < 50) {
                return NextResponse.json({ error: `Could not extract enough text from the document to generate a quiz. Captured length: ${fileText?.length || 0}. Preview: ${fileText?.slice(0, 50)}` }, { status: 400 });
            }
            console.log(`Extracted ${fileText.length} characters from document.`);
        }

        // Truncate text to prevent local AI model from hanging on massive inputs
        const MAX_CHARS = 20000;
        if (fileText.length > MAX_CHARS) {
            console.log(`Truncating text from ${fileText.length} to ${MAX_CHARS} characters.`);
            fileText = fileText.slice(0, MAX_CHARS) + "\n\n...[TEXT TRUNCATED FOR LENGTH]...";
        }

        // 2. Generate structured Quiz using Cloud AI via Vercel AI SDK
        const { object: quiz } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                title: z.string().describe("The title of the generated quiz."),
                questions: z.array(z.object({
                    question: z.string().describe("The multiple choice question. Very clear and concise."),
                    options: z.array(z.string()).length(4).describe("Exactly 4 options for the user to select from."),
                    correctAnswer: z.string().describe("The exact string of the correct option from the options array."),
                    explanation: z.string().describe("A brief explanation of why this answer is correct based on the text.")
                })).length(10).describe("Exactly 10 questions related to the core concepts in the academic material provided.")
            }),
            prompt: `You are an expert academic tutor. 
Generate a comprehensive 10-question multiple-choice quiz based ONLY on the following study notes provided below. 
The subject is: ${promptSubject}. Context: ${promptTitleContext}.

Make the questions challenging but fair, testing core concepts, facts, and understanding of the material.
Ensure exactly one option is unambiguously correct.

--- DOCUMENT CONTENT ---
${fileText}
--- END CONTENT ---
            `
        });

        return NextResponse.json(quiz);

    } catch (error: any) {
        console.error("Quiz generation error:", error);

        const errorMessage = error?.message || "";
        if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("rate limit")) {
            return NextResponse.json({
                error: "You've generated too many quizzes too quickly! Please wait a few minutes for your API free tier quota to refresh."
            }, { status: 429 });
        }

        return NextResponse.json({ error: `AI ERROR: ${error.message || error}` }, { status: 500 });
    }
}
