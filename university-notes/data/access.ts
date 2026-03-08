import { promises as fs } from 'fs';
import path from 'path';
import { Note } from './types';

export async function getNotes(): Promise<Note[]> {
    const filePath = path.join(process.cwd(), 'data', 'notes.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error("Error reading notes file:", error);
        return [];
    }
}
