const fs = require('fs');
const pdf = require('pdf-parse');

async function testPdfFetch() {
    const url = "https://utfs.io/f/bbf2da11-fec8-49d7-bfeb-ffcd870aade8-w1nzh0.pdf";
    console.log("Fetching UploadThing PDF:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log("Fetch failed:", response.status, response.statusText);
            return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("Fetched bytes:", buffer.length);

        console.log("Parsing PDF...");
        const data = await pdf(buffer);
        console.log("Extracted text length:", data.text?.length);
        if (data.text?.length > 0) {
            console.log("Preview:", data.text.slice(0, 100).replace(/\n/g, " "));
        }
    } catch (e) {
        console.error("Test failed", e);
    }
}

testPdfFetch();
