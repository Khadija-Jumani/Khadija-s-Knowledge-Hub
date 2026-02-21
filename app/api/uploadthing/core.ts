import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    noteUploader: f({
        pdf: { maxFileSize: "32MB", maxFileCount: 10 },
        text: { maxFileSize: "32MB", maxFileCount: 10 },
        image: { maxFileSize: "32MB", maxFileCount: 10 },
        blob: { maxFileSize: "32MB", maxFileCount: 10 },
    })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata);
            console.log("file url", file.url);
            return { uploadedBy: "user" };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
