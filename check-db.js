const { connectToDB } = require('./lib/db');
const Note = require('./lib/models/Note').default;

async function checkWebTechNotes() {
    try {
        await connectToDB();
        const notes = await Note.find({ subject: "Web Technology | CSC336" });
        console.log(`Found ${notes.length} notes for Web Technology | CSC336`);
        notes.forEach(n => {
            console.log(`- Title: ${n.title}, URL: ${n.downloadUrl}`);
        });
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

checkWebTechNotes();
