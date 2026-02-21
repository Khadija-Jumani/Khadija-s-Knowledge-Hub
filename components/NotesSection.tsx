"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FolderCard from "./FolderCard";
import FolderViewModal from "./FolderViewModal";
import { cn } from "@/lib/utils";
import { Note } from "@/data/types";

interface NotesSectionProps {
    initialNotes: Note[];
}

export default function NotesSection({ initialNotes }: NotesSectionProps) {
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    // Group Notes by Subject (for Folder View)
    const groupedNotes = useMemo(() => {
        const groups: Record<string, Note[]> = {};
        initialNotes.forEach(note => {
            if (!groups[note.subject]) {
                groups[note.subject] = [];
            }
            groups[note.subject].push(note);
        });
        return groups;
    }, [initialNotes]);

    const subjects = Object.keys(groupedNotes);
    const selectedFolderNotes = selectedSubject ? groupedNotes[selectedSubject] : [];

    return (
        <section id="notes" className="py-24 max-w-6xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-12"
            >
                <h2 className="text-4xl font-bold text-slate-900 font-heading">
                    <span className="text-primary italic mr-2">Notes</span> Library
                </h2>
                <div className="h-px bg-primary/10 flex-grow max-w-xs"></div>
            </motion.div>

            {/* Folders Grid */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {subjects.map((subject) => (
                        <motion.div
                            key={subject}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FolderCard
                                subject={subject}
                                notes={groupedNotes[subject]}
                                onClick={() => setSelectedSubject(subject)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {subjects.length === 0 && (
                <div className="text-center text-slate-500 py-12 border border-slate-800 rounded-lg border-dashed">
                    <p>No folders found.</p>
                    <p className="text-sm mt-2">Upload a note to create a new folder.</p>
                </div>
            )}

            {/* Folder View Modal */}
            {selectedSubject && (
                <FolderViewModal
                    isOpen={!!selectedSubject}
                    onClose={() => setSelectedSubject(null)}
                    subject={selectedSubject}
                    notes={selectedFolderNotes || []}
                />
            )}
        </section>
    );
}
