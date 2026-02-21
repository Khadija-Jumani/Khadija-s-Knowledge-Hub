"use client";
import React, { useState } from "react";
import { X, FileText, Download, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Note } from "@/data/types";
import { deleteNote } from "@/app/actions";
import UploadModal from "./UploadModal";
import JSZip from "jszip";

interface FolderViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: string;
    notes: any[];
}

export default function FolderViewModal({ isOpen, onClose, subject, notes }: FolderViewModalProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleDelete = async (noteId: string, downloadUrl: string) => {
        if (confirm("Are you sure you want to delete this file?")) {
            setDeletingId(noteId);
            await deleteNote(noteId, downloadUrl);
            setDeletingId(null);
            if (notes.length <= 1) onClose();
        }
    };

    const [isZipping, setIsZipping] = useState(false);

    const handleDownloadAll = async () => {
        if (notes.length === 0) return;
        setIsZipping(true);
        const zip = new JSZip();

        try {
            const downloadPromises = notes.map(async (note) => {
                const response = await fetch(note.downloadUrl);
                const blob = await response.blob();
                const extension = note.downloadUrl.split('.').pop()?.split('?')[0] || 'pdf';
                const fileName = `${note.title}.${extension}`;
                zip.file(fileName, blob);
            });

            await Promise.all(downloadPromises);
            const content = await zip.generateAsync({ type: "blob" });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = `${subject}_all_notes.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("ZIP Error:", error);
            alert("Failed to create ZIP file.");
        } finally {
            setIsZipping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_30px_90px_-20px_rgba(124,61,255,0.2)] border border-white overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-8 border-b border-slate-50">
                            <div className="flex-grow pr-4">
                                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="text-primary italic">📂</span> {subject}
                                </h3>
                                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
                                    {notes.length} Academic Resource{notes.length !== 1 && 's'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {notes.length > 1 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleDownloadAll}
                                        disabled={isZipping}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full transition-shadow shadow-lg shadow-green-500/20 text-xs font-bold disabled:opacity-50"
                                    >
                                        {isZipping ? <Download className="animate-bounce" size={14} /> : <Download size={14} />}
                                        {isZipping ? "Creating..." : "ZIP All"}
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsUploadOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg shadow-primary/20 text-xs font-bold"
                                >
                                    + Add
                                </motion.button>
                                <button
                                    onClick={onClose}
                                    className="text-slate-300 hover:text-slate-600 transition-colors p-2 bg-slate-50 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="p-8 overflow-y-auto space-y-4 flex-grow bg-slate-50/30">
                            {notes.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-2">🎈</div>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Folder is empty</p>
                                </div>
                            ) : (
                                notes.map((note, index) => (
                                    <motion.div
                                        key={note._id || note.id || `note-${index}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100/50 hover:border-primary/20 hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-slate-800 font-bold text-sm truncate pr-4">{note.title}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{note.date}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <a
                                                href={note.downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                title="Download"
                                            >
                                                <Download size={18} />
                                            </a>
                                            <button
                                                onClick={() => handleDelete(note._id || note.id!, note.downloadUrl)}
                                                disabled={deletingId === (note._id || note.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                {deletingId === (note._id || note.id) ? (
                                                    <span className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin block"></span>
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                prefilledSubject={subject}
            />
        </AnimatePresence>
    );
}
