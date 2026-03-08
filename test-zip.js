const https = require('https');

async function debugZip() {
    const zipUrl = "https://utfs.io/f/suUomiCfdkxvUcLhUhnDIybQdO2fMnkr6vKzgh8pAjimHUa0o";
    console.log("Analyzing ZIP byte signature for:", zipUrl);

    https.get(zipUrl, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', async () => {
            const buffer = Buffer.concat(chunks);
            console.log("Buffer size:", buffer.length);
            console.log("First 50 bytes (hex):", buffer.slice(0, 50).toString('hex'));
            console.log("First 50 bytes (string):", buffer.slice(0, 50).toString('utf-8'));
        });
    });
}

debugZip();
