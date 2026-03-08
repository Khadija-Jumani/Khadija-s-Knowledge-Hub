import { motion } from "framer-motion";
import { Folder } from "lucide-react";

interface FolderCardProps {
    subject: string;
    notes: any[]; // Changed to any for flexibility with Mongo/Local objects
    onClick: () => void;
}

export default function FolderCard({ subject, notes, onClick }: FolderCardProps) {
    // Get the latest date
    const lastUpdated = notes[0]?.date || "N/A";
    const fileCount = notes.length;

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={onClick}
            className="bg-white p-6 rounded-2xl cursor-pointer shadow-[0_10px_40px_-15px_rgba(124,61,255,0.15)] group border border-slate-100 hover:border-primary/30 h-full flex flex-col items-start transition-colors duration-300"
        >
            <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Folder size={32} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
                {subject}
            </h3>

            <div className="flex items-center gap-3 text-sm font-mono text-slate-500 mt-auto w-full pt-4 border-t border-slate-100">
                <span className="bg-primary/10 px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-tight">
                    {fileCount} File{fileCount !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] ml-auto font-bold opacity-70">
                    UPDATED: {lastUpdated}
                </span>
            </div>
        </motion.div>
    );
}
