import { useState } from "react";
import { motion } from "framer-motion";
import { Code, Database, PenTool, Briefcase, FileText, Trash2, Download } from "lucide-react";
import { deleteNote, checkAdminStatus } from "@/app/actions";

const categoryIcons = {
    "Computer Science": Code,
    "Data Science": Database,
    "Graphic Design": PenTool,
    "Management": Briefcase,
};

export default function NoteCard({ note }: { note: any }) {
    const Icon = categoryIcons[note.category as keyof typeof categoryIcons] || FileText;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useState(() => {
        const checkAuth = async () => {
            const status = await checkAdminStatus();
            setIsAdmin(status);
        };
        checkAuth();
    });

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this note?")) {
            setIsDeleting(true);
            await deleteNote(note.id, note.downloadUrl);
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(124,61,255,0.1)] group border border-slate-100 hover:border-primary/20 h-full flex flex-col relative transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={22} />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded uppercase">
                        {note.date}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Delete Note"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                {note.title}
            </h3>

            <div className="text-sm font-bold font-mono text-primary/80 mb-3">
                {note.subject}
            </div>

            <p className="text-slate-500 text-sm mb-6 flex-grow leading-relaxed">
                {note.description}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-50">
                <a
                    href={note.downloadUrl}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all"
                >
                    <Download size={16} />
                    Download Note
                </a>
            </div>
        </motion.div>
    );
}
