const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://khadijajumani:khajja123098@clothing-dataset.0d4tnps.mongodb.net/?appName=clothing-dataset";
const DB_NAME = "university-notes";

async function run() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('notes');
        const notes = await collection.find({ subject: "Web Technology | CSC336" }).toArray();
        console.log(`Found ${notes.length} notes`);

        for (const n of notes) {
            console.log(`---`);
            console.log(`Title: ${n.title}`);
            console.log(`URL: ${n.downloadUrl}`);

            if (n.downloadUrl) {
                try {
                    const res = await fetch(n.downloadUrl, { method: 'HEAD' });
                    console.log(`Status: ${res.status}`);
                    console.log(`ContentType: ${res.headers.get('content-type')}`);
                } catch (e) { console.log("Fetch failed for " + n.title); }
            }
        }
    } finally {
        await client.close();
    }
}
run();
