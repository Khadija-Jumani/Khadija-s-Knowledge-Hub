"use client";
import React, { useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveNoteMetadata } from '@/app/actions'; // Import updated server action
import { cn } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefilledSubject?: string;
}

export default function UploadModal({ isOpen, onClose, prefilledSubject }: UploadModalProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { startUpload } = useUploadThing("noteUploader", {
        onUploadProgress: (p) => setUploadProgress(p),
        onClientUploadComplete: () => setUploadProgress(0),
        onUploadError: (e) => {
            console.error(e);
            setMessage(`Upload Error: ${e.message}`);
            setLoading(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;
        const subject = formData.get("subject") as string;
        const category = formData.get("category") as string || "General";
        const description = formData.get("description") as string;
        const password = formData.get("password") as string;
        const files = formData.getAll("file") as File[];

        if (!files.length) {
            setMessage("Please select at least one file.");
            setLoading(false);
            return;
        }

        try {
            // 1. Upload files directly to UploadThing from client
            const uploadedFiles = await startUpload(files);

            if (!uploadedFiles || uploadedFiles.length === 0) {
                throw new Error("Upload failed or returned no files.");
            }

            // 2. Save metadata to MongoDB via Server Action
            const result = await saveNoteMetadata({
                title,
                subject,
                category,
                description,
                password,
                files: uploadedFiles.map(f => ({
                    url: f.url,
                    key: f.key,
                    name: f.name
                }))
            });

            if (result && result.success) {
                alert("Note(s) uploaded successfully!");
                onClose();
            } else {
                setMessage(result?.message || "Metadata saving failed.");
            }
        } catch (error: any) {
            console.error(error);
            setMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/10 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(124,61,255,0.3)] border border-white p-8 overflow-hidden relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors p-2 bg-slate-50 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                                <UploadCloud size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 font-heading">Upload <span className="text-primary italic">Resources</span></h2>
                            <p className="text-slate-500 text-sm mt-1">Populate your academic library with new notes.</p>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3",
                                    message.toLowerCase().includes("success") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}
                            >
                                {message.toLowerCase().includes("success") ? "✅" : "⚠️"} {message}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">Title / Topic</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. Advanced AI Algorithms"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    />
                                </div>

                                {!prefilledSubject && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">Subject Name</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            required
                                            defaultValue={prefilledSubject || ""}
                                            placeholder="e.g. Artificial Intelligence CSC462"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                        />
                                    </div>
                                )}
                                {prefilledSubject && <input type="hidden" name="subject" value={prefilledSubject} />}
                                <input type="hidden" name="category" value="General" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">Select Files (Max 10 / 32MB each)</label>
                                <input
                                    type="file"
                                    name="file"
                                    multiple
                                    required
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">ZIP and other large files are now supported.</p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">Admin Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50 mt-4 overflow-hidden relative"
                            >
                                {loading ? (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>{uploadProgress > 0 ? `Uploading (${uploadProgress}%)` : "Processing..."}</span>
                                        </div>
                                        {uploadProgress > 0 && (
                                            <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        )}
                                    </>
                                ) : (
                                    <><UploadCloud size={20} /> Upload Files</>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
