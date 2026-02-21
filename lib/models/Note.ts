import { Schema, model, models } from 'mongoose';

const NoteSchema = new Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, default: 'General' },
    downloadUrl: { type: String, required: true },
    fileKey: { type: String }, // For deleting from UploadThing
    description: { type: String },
    date: { type: String, required: true },
}, { timestamps: true });

const Note = models.Note || model('Note', NoteSchema);

export default Note;
