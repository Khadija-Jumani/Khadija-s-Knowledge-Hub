import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
    noteUploader: f({
        pdf: { maxFileSize: "16MB", maxFileCount: 1 },
        text: { maxFileSize: "16MB", maxFileCount: 1 },
        image: { maxFileSize: "16MB", maxFileCount: 1 },
        blob: { maxFileSize: "16MB", maxFileCount: 1 },
    })
        .onUploadComplete(async ({ metadata, file }) => {
            console.log("Upload complete for userId:", metadata);
            console.log("file url", file.url);
            return { uploadedBy: "user" };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
