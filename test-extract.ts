import { extractTextFromUrl } from "./lib/ai-utils";

async function run() {
    // Assuming the file from the screenshot is this one based on previous logs, or just any uploaded file
    const testUrl = "https://utfs.io/f/bbf2da11-fec8-49d7-bfeb-ffcd870aade8-w1nzh0.pdf";

    console.log("Starting extraction test on:", testUrl);
    try {
        const text = await extractTextFromUrl(testUrl, "Test Doc");
        console.log("Extraction Result Length:", text.length);
        console.log("Preview:", text.slice(0, 100));
    } catch (e) {
        console.error("Test failed:", e);
    }
}

run();
