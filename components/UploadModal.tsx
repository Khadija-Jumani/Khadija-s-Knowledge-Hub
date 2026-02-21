"use client";
import React, { useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadNote } from '@/app/actions'; // Import server action
import { cn } from '@/lib/utils';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    prefilledSubject?: string;
}

export default function UploadModal({ isOpen, onClose, prefilledSubject }: UploadModalProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);

        try {
            // Call server action
            const result = await uploadNote(formData);

            if (result && result.success) {
                alert("Note uploaded successfully!");
                onClose();
            } else {
                setMessage(result?.message || "Upload failed. Please try again.");
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/10 backdrop-blur-md">
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
                                    message.includes("success") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                )}
                            >
                                {message.includes("success") ? "✅" : "⚠️"} {message}
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
                                <label className="block text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">Select Files (Max 10)</label>
                                <input
                                    type="file"
                                    name="file"
                                    multiple
                                    required
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">You can select multiple files at once.</p>
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
                                className="w-full bg-primary text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><UploadCloud size={20} /> Upload Files</>}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
