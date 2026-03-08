if (typeof global !== 'undefined' && !global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
    } as any;
}

const pdfParse = require('pdf-parse');
import JSZip from 'jszip';

/**
 * Fetches a file from a URL and extracts its text.
 * Currently supports PDF and raw text/markdown files.
 */
export async function extractTextFromUrl(url: string, title: string = "Document"): Promise<string> {
    try {
        // Ensure the URL is absolute for server-side fetching
        let absoluteUrl = url;
        if (url.startsWith("/")) {
            // Next.js backend fetch() requires absolute URLs
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            absoluteUrl = `${baseUrl}${url}`;
        }

        absoluteUrl = encodeURI(absoluteUrl);

        console.log("Fetching PDF from URL:", absoluteUrl);
        const response = await fetch(absoluteUrl, { cache: "no-store" });
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`File not found at ${absoluteUrl}. Skipping extraction.`);
                return ""; // Gracefully ignore dead mock URLs so other files can still be processed
            }
            throw new Error(`Failed to fetch file from ${absoluteUrl}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf")) {
            try {
                const data = await pdfParse(buffer);
                if (data && data.text && data.text.trim().length > 50) {
                    return data.text;
                }
            } catch (pdfError: any) {
                console.log("pdfParse threw an error, trying manual fallback...", pdfError);
                throw new Error(`PDFParse stack trace: ${pdfError.stack || pdfError.message || pdfError}`);
            }
            console.log("Using raw regex PDF fallback extraction...");
            const rawString = buffer.toString('utf8');
            // Remove PDF structural elements and preserve standard text
            const filteredText = rawString.replace(/[\x00-\x1F\x7F-\xFF]/g, ' ')
                .replace(/[\\/\(\)\[\]<>{}=+-]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            return filteredText.length > 50 ? filteredText : "";

        } else if (
            contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml") ||
            url.toLowerCase().endsWith(".docx")
        ) {
            console.log("Extracting text from DOCX file...");
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(buffer);

            // DOCX text is primarily stored in word/document.xml
            const documentXml = loadedZip.file("word/document.xml");
            if (!documentXml) {
                throw new Error("Invalid DOCX format: missing word/document.xml");
            }

            const xmlStr = await documentXml.async("string");

            // Quick regex to strip XML tags and extract just the text nodes
            const rawText = xmlStr.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

            if (rawText.length > 50) {
                return rawText;
            }
            return "";

        } else if (
            contentType.includes("text/plain") ||
            contentType.includes("text/markdown") ||
            url.toLowerCase().endsWith(".txt") ||
            url.toLowerCase().endsWith(".md")
        ) {
            return buffer.toString("utf-8");
        } else {
            console.warn(`Unsupported content type ${contentType} for file ${url}. Cannot extract text.`);
            return ""; // Gracefully skip unsupported files like ZIP archives
        }
    } catch (error: any) {
        console.error("Error extracting text:", error);
        return ""; // Bubble up empty string instead of crashing the whole quiz generator
    }
}
