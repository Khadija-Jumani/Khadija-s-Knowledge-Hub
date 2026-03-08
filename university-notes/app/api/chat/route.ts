import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return new Response("Missing Gemini API Key", { status: 500 });
        }

        const { messages, documentContext } = await req.json();

        // System prompt
        let sysPrompt = `You are the official AI Assistant for Khadija's Knowledge Hub.
Your goal is to provide accurate, helpful, and polite answers to users.

### CORE RULES:
1. IDENTITY: Always identify as "Study Assistant" from Khadija's Knowledge Hub.
2. SCOPE: Focus specifically on university notes, study materials, and academic resources. If a user asks about something completely unrelated, gently steer them back.
3. TONE: Maintain a Friendly and Professional tone. Use clear, concise language. 
4. ACCURACY: If you don't know the answer based on the website info provided, say "I'm sorry, I don't have that information right now. Would you like to contact our support team?"
5. FORMATTING: Use Markdown (bolding, bullet points) to make long answers easy to read.
6. NO HALLUCINATION: Do not make up fake resources, notes, or services that do not exist.

### KNOWLEDGE BASE:
- About us: Khadija's Knowledge Hub is a premier platform dedicated to providing university students with high-quality notes, study guides, and academic materials to help them excel in their educational journey.
- Services: Browsing course notes, uploading study materials, accessing academic resources, and generating quizzes from uploaded documents.
- FAQs: 
  - Q: How do I upload notes? A: Use the 'Upload' button in the navigation bar to share your study materials.
  - Q: Are the notes free? A: Yes, notes shared by the community are available to all students.
  - Q: Can I generate quizzes? A: Yes, you can generate interactive quizzes from your uploaded PDF documents.`;

        if (documentContext) {
            sysPrompt += `\n\n### CURRENT DOCUMENT CONTEXT:
The user is currently looking at a specific document. Use the following document context to answer their questions if relevant. 
If their question is unrelated to the document, answer generally based on your core rules, but mention you have the document context if they want to ask about it.
--- DOCUMENT CONTENT ---
${documentContext}
--- END CONTENT ---`;
        }

        // Sanitize messages to strictly match the generative UI ModelMessage schema 
        // to prevent Validation Errors caused by extra metadata injected by the React hook.
        const sanitizedMessages = messages.map((m: any) => ({
            role: m.role,
            content: m.content || (m.parts ? m.parts.map((p: any) => p.text).join("") : "")
        }));

        const google = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        const result = await streamText({
            model: google("gemini-2.5-flash"),
            system: sysPrompt,
            messages: sanitizedMessages,
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}
