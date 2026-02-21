"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "@/lib/db";
import Note from "@/lib/models/Note";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

const utapi = new UTApi(); // Initialize UploadThing API

export async function uploadNote(formData: FormData) {
    try {
        // 1. Check for Missing Keys
        if (!process.env.MONGODB_URI) return { success: false, message: "Database Configuration Error" };
        if (!process.env.UPLOADTHING_TOKEN) return { success: false, message: "Storage Configuration Error" };
        if (!process.env.ADMIN_PASSWORD) return { success: false, message: "Security Error" };

        await connectToDB();

        const title = formData.get("title") as string;
        const subject = formData.get("subject") as string;
        const category = formData.get("category") as string || "General";
        const description = formData.get("description") as string;
        const password = formData.get("password") as string;

        // Get ALL files from the form
        const files = formData.getAll("file") as File[];

        if (password !== process.env.ADMIN_PASSWORD) {
            return { success: false, message: "Incorrect Admin Password." };
        }

        if (!files.length || !title || !subject) {
            return { success: false, message: "Missing required fields." };
        }

        console.log(`Uploading ${files.length} files...`);

        // 2. Upload multiple files to UploadThing
        const responses = await utapi.uploadFiles(files);

        const errors = responses.filter(r => r.error);
        if (errors.length > 0) {
            return { success: false, message: `Storage Error: ${errors[0].error?.message}` };
        }

        // 3. Save each file to MongoDB
        const savePromises = responses.map((response, index) => {
            if (!response.data) return null;

            const { url: downloadUrl, key: fileKey } = response.data;
            const originalFile = files[index];

            // If multiple files, append original filename to title if it's the generic one
            const fileTitle = files.length > 1 ? `${title} - ${originalFile.name}` : title;

            const newNote = new Note({
                title: fileTitle,
                subject,
                category,
                description,
                date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
                downloadUrl,
                fileKey
            });

            return newNote.save();
        });

        await Promise.all(savePromises.filter(p => p !== null));

        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Upload error:", error);
        return { success: false, message: `System Error: ${error.message || "Unknown error"}` };
    }
}

export async function deleteNote(noteId: string, fileUrl: string, password?: string) {
    try {
        const adminPassword = process.env.ADMIN_PASSWORD;
        const cookieStore = await cookies();
        const isAdmin = cookieStore.get("admin_auth")?.value === adminPassword;

        if (!isAdmin && password !== adminPassword) {
            return { success: false, message: "Incorrect Admin Password." };
        }

        await connectToDB();

        // 1. Find note to get fileKey
        const note = await Note.findOne({ _id: noteId });
        if (!note) {
            // If not in DB, try to delete from FS just in case (legacy) or just return
            return { success: false, message: "Note not found" };
        }

        // 2. Delete from UploadThing
        if (note.fileKey) {
            await utapi.deleteFiles(note.fileKey);
        }

        // 3. Delete from MongoDB
        await Note.findByIdAndDelete(noteId);

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, message: "Failed to delete note" };
    }
}

export async function loginAdmin(password: string) {
    if (password === process.env.ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set("admin_auth", password, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return { success: true };
    }
    return { success: false, message: "Incorrect password" };
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_auth");
    revalidatePath("/");
    return { success: true };
}

export async function checkAdminStatus() {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("admin_auth")?.value === process.env.ADMIN_PASSWORD;
    return isAdmin;
}

export async function getNotes() {
    let mongoNotes: any[] = [];
    let localNotes: any[] = [];

    // 1. Try to fetch from MongoDB
    try {
        await connectToDB();
        const found = await Note.find({}).sort({ createdAt: -1 });
        mongoNotes = JSON.parse(JSON.stringify(found));
    } catch (error) {
        console.warn("MongoDB fetch failed, sticking to local data.");
    }

    // 2. Always try to fetch from Local JSON as well during migration
    try {
        const fs = require('fs/promises');
        const path = require('path');
        const localData = await fs.readFile(path.join(process.cwd(), "data", "notes.json"), "utf-8");
        localNotes = JSON.parse(localData);
    } catch (error) {
        console.warn("Local JSON fetch failed.");
    }

    // 3. Merge both (Cloud notes first so they appear at top)
    return [...mongoNotes, ...localNotes];
}
