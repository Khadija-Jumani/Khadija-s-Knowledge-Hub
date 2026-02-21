"use client";
import { motion } from "framer-motion";
import { Mail, Instagram } from "lucide-react";

export default function ContactSection() {
    return (
        <section id="contact" className="py-24 text-center max-w-3xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
            >
                <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mb-4">What's Next?</p>
                <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 font-heading">Get In <span className="text-primary italic">Touch</span></h2>
                <p className="text-slate-600 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                    Whether you have a question about a specific note, want guidance on a concept, or wish to collaborate on a project, my inbox is always open!
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <motion.a
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        href="mailto:khadijajumani@gmail.com"
                        className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                        <Mail size={20} /> Email Me
                    </motion.a>
                    <motion.a
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        href="https://www.instagram.com/im_idealizer?igsh=MXV3cWUwbXJhOXFidQ=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-full font-bold shadow-sm hover:border-primary/50 transition-all"
                    >
                        <Instagram size={20} /> Instagram
                    </motion.a>
                </div>
            </motion.div>
        </section>
    );
}
