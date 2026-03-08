"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Send, Star, Trash2 } from "lucide-react";
import { submitFeedback, deleteFeedback } from "@/app/actions";

interface FeedbackItem {
    _id: string;
    name: string;
    comment: string;
    createdAt: string;
}

interface FeedbackSectionProps {
    initialFeedbacks: FeedbackItem[];
    isAdmin?: boolean;
}

export default function FeedbackSection({ initialFeedbacks, isAdmin }: FeedbackSectionProps) {
    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // We keep local state so the new feedback appears instantly on success
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        if (!name.trim() || !comment.trim()) {
            setMessage({ text: "Please provide both your name and comment.", type: "error" });
            return;
        }

        setIsSubmitting(true);
        const res = await submitFeedback(name, comment);

        if (res.success) {
            setMessage({ text: "Thank you for your feedback!", type: "success" });

            // Optimistically add the new feedback to the top of the list locally
            const newFeedback: FeedbackItem = {
                _id: Date.now().toString(),
                name,
                comment,
                createdAt: new Date().toISOString()
            };

            setFeedbacks(prev => [newFeedback, ...prev]);

            // Reset form
            setName("");
            setComment("");
        } else {
            setMessage({ text: res.message || "Failed to submit feedback.", type: "error" });
        }
        setIsSubmitting(false);

        // Clear message after 5 seconds
        setTimeout(() => {
            setMessage({ text: "", type: "" });
        }, 5000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this feedback?")) return;

        setDeletingId(id);
        const res = await deleteFeedback(id);

        if (res.success) {
            // Optimistically remove from UI
            setFeedbacks(prev => prev.filter(f => f._id !== id));
        } else {
            alert(res.message || "Failed to delete feedback");
        }
        setDeletingId(null);
    };

    return (
        <section id="feedback" className="py-24 max-w-6xl mx-auto px-4 w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
            >
                <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">Community</p>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-heading">
                    User <span className="text-primary italic">Feedback</span>
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                    Hear what other students have to say, or share your own experience using University Notes!
                </p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-12 items-start">
                {/* Left Side: Feedback Form */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <MessageSquare className="text-primary" size={24} />
                        Share Your Thoughts
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Your Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={18} />
                                </span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                    disabled={isSubmitting}
                                    maxLength={50}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Your Experience</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="How did these notes help you ace your exams?"
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                disabled={isSubmitting}
                                maxLength={500}
                            />
                            <div className="text-right text-[10px] text-slate-400 font-medium">
                                {comment.length}/500
                            </div>
                        </div>

                        <AnimatePresence>
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`text-sm py-3 px-4 rounded-xl border font-medium flex items-center gap-2 ${message.type === "success"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-red-50 text-red-600 border-red-200"
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim() || !comment.trim()}
                            className="w-full bg-slate-900 hover:bg-primary text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 shadow-xl shadow-slate-900/10 group"
                        >
                            {isSubmitting ? (
                                "Submitting..."
                            ) : (
                                <>
                                    Submit Feedback
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Right Side: Masonry-ish Grid of Feedbacks */}
                <div className="lg:col-span-3">
                    {feedbacks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                            <Star className="text-slate-300 mb-4" size={48} />
                            <h4 className="text-slate-500 font-bold mb-2">No feedback yet</h4>
                            <p className="text-slate-400 text-sm">Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4 auto-rows-max">
                            <AnimatePresence>
                                {feedbacks.map((item, i) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: Math.min(i * 0.1, 0.5) }}
                                        className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group/card ${
                                            // Make some cards span full width to break up the grid playfully
                                            i % 3 === 0 ? "sm:col-span-2 shadow-md bg-gradient-to-br from-white to-slate-50" : ""
                                            }`}
                                    >
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                disabled={deletingId === item._id}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover/card:opacity-100 focus:opacity-100"
                                                title="Delete Feedback"
                                            >
                                                <Trash2 size={16} className={deletingId === item._id ? "animate-pulse" : ""} />
                                            </button>
                                        )}
                                        <div className="flex items-center gap-3 mb-4 pr-8">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg font-heading">
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>

                                            {/* decorative stars */}
                                            <div className="ml-auto flex gap-0.5 text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill="currentColor" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed italic pr-2">
                                            "{item.comment}"
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
