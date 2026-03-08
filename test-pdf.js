const fs = require('fs');
const pdf = require('pdf-parse');

async function downloadAndParse() {
    // A known working public URL for testing if the user's specific utfs.io URL is actually dead
    const testUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    console.log("Fetching test PDF...");
    const req = await fetch(testUrl);
    const buffer = Buffer.from(await req.arrayBuffer());
    console.log("Downloaded bytes:", buffer.length);

    try {
        console.log("Parsing test PDF...");
        const data = await pdf(buffer);
        console.log("Parsed length:", data.text.length);
        console.log("Preview:", data.text.slice(0, 100).trim());
    } catch (e) {
        console.error("Parse failed:", e);
    }
}
downloadAndParse();
