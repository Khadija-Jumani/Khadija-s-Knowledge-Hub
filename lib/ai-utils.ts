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
        let buffer: Buffer;
        let contentType: string = "";

        if (url.startsWith("/")) {
            // Local file access - much more robust than fetch
            const path = require('path');
            const fs = require('fs/promises');
            const absolutePath = path.join(process.cwd(), "public", url);
            console.log("Reading local file from path:", absolutePath);

            const fileData = await fs.readFile(absolutePath);
            buffer = Buffer.from(fileData);

            // Infer content type for local files
            if (url.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";
            else if (url.toLowerCase().endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml";
            else if (url.toLowerCase().endsWith(".txt")) contentType = "text/plain";
            else if (url.toLowerCase().endsWith(".md")) contentType = "text/markdown";
        } else {
            // Cloud file access (UploadThing, etc)
            console.log("Fetching cloud file from URL:", url);
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) {
                console.warn(`Failed to fetch file from ${url}: ${response.statusText}`);
                return "";
            }
            const arrayBuffer = await response.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
            contentType = response.headers.get("Content-Type") || "";

            // Check if we got an HTML error page instead of a document
            const firstBytes = buffer.slice(0, 100).toString('utf-8').trim().toLowerCase();
            if (firstBytes.startsWith("<html") || firstBytes.startsWith("<!doctype")) {
                console.warn(`File at ${url} appears to be an HTML error page, not a document.`);
                return "";
            }
        }

        if (contentType.includes("application/zip") || contentType.includes("application/x-zip-compressed") || url.toLowerCase().endsWith(".zip")) {
            console.log("Extracting text from ZIP archive...");
            try {
                const zip = new JSZip();
                const loadedZip = await zip.loadAsync(buffer);
                let combinedText = "";

                const filePromises = Object.keys(loadedZip.files).map(async (fileName) => {
                    const file = loadedZip.files[fileName];
                    if (file.dir) return "";

                    const fileBuffer = await file.async("nodebuffer");
                    const ext = fileName.toLowerCase().split('.').pop();

                    if (ext === "pdf") {
                        try {
                            const data = await pdfParse(fileBuffer);
                            return data.text || "";
                        } catch (e) {
                            console.warn(`Failed to parse PDF inside ZIP: ${fileName}`);
                            return "";
                        }
                    } else if (ext === "docx") {
                        try {
                            const subZip = new JSZip();
                            const subLoaded = await subZip.loadAsync(fileBuffer);
                            const docXml = subLoaded.file("word/document.xml");
                            if (docXml) {
                                const xmlStr = await docXml.async("string");
                                return xmlStr.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                            }
                        } catch (e) {
                            console.warn(`Failed to parse DOCX inside ZIP: ${fileName}`);
                            return "";
                        }
                    } else if (["txt", "md", "json", "js", "html", "css"].includes(ext || "")) {
                        return fileBuffer.toString("utf-8");
                    }
                    return "";
                });

                const results = await Promise.all(filePromises);
                combinedText = results.filter(t => t.trim().length > 0).join("\n\n---\n\n");

                console.log(`Extracted ${combinedText.length} characters from ZIP. Files processed: ${results.filter(t => t.length > 0).length}`);
                return combinedText;
            } catch (zipErr: any) {
                console.error("ZIP extraction failed:", zipErr);
                return "";
            }
        } else if (contentType.includes("application/pdf") || url.toLowerCase().endsWith(".pdf")) {
            console.log("Extracting text from PDF using pdf-parse...");
            try {
                // Buffer is already available
                const pdfData = await pdfParse(buffer);
                if (pdfData && pdfData.text && pdfData.text.trim().length > 50) {
                    return pdfData.text;
                }
            } catch (pdfError: any) {
                console.error("pdf-parse failed:", pdfError);
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
