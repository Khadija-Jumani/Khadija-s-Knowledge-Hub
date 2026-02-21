"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Instagram, Code } from "lucide-react";
import ProfilePic from "./WhatsApp Image 2025-10-10 at 22.53.09_3c051aa6.jpg";

const roles = ["Data Analyst", "BI Analyst", "Data Engineer", "Web Developer", "Graphic Designer", "Lecturer"];

export default function Hero() {
    const [roleIndex, setRoleIndex] = useState(0);
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentRole = roles[roleIndex];
        const typeSpeed = isDeleting ? 50 : 100;

        const timeout = setTimeout(() => {
            if (!isDeleting && text === currentRole) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setRoleIndex((prev) => (prev + 1) % roles.length);
            } else {
                setText(currentRole.substring(0, text.length + (isDeleting ? -1 : 1)));
            }
        }, typeSpeed);

        return () => clearTimeout(timeout);
    }, [text, isDeleting, roleIndex]);

    return (
        <section className="min-h-screen flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto pt-20 px-4 gap-12">
            <div className="flex-1 space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider mb-4"
                >
                    ● AVAILABLE FOR OPPORTUNITIES
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-8xl font-bold font-heading text-slate-900 leading-[1.1]"
                >
                    I am a <br />
                    <span className="text-primary relative inline-block">
                        <span className="border-r-4 border-primary/40 pr-2">{text}</span>
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-600 text-lg leading-relaxed space-y-4 max-w-2xl mt-8"
                >
                    <p>
                        Hi, I'm <span className="text-slate-900 font-bold">Khadija Jumani</span>. A Data Science Enthusiast, Passionate
                        Lecturer, and Lifelong Learner based in Islamabad. I unlock insights to
                        drive business growth & social impact.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-4 mt-8"
                >
                    <motion.a
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        href="mailto:khadijajumani@gmail.com"
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                    >
                        <Mail size={18} /> Email Me
                    </motion.a>
                    <motion.a
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        href="https://www.linkedin.com/in/khadija-jumani-728872305"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-medium shadow-sm hover:border-primary/50 transition-colors"
                    >
                        <Linkedin size={18} /> LinkedIn
                    </motion.a>
                    <motion.a
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        href="https://www.instagram.com/im_idealizer?igsh=MXV3cWUwbXJhOXFidQ=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-medium shadow-sm hover:border-primary/50 transition-colors"
                    >
                        <Instagram size={18} /> Instagram
                    </motion.a>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 flex justify-center md:justify-end relative w-full max-w-md"
            >
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden border-[8px] border-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={ProfilePic.src}
                        alt="Khadija Jumani"
                        className="relative z-10 w-full h-full object-cover scale-110 hover:scale-120 transition-transform duration-500"
                    />

                    <motion.div
                        whileHover={{ scale: 1.1, rotate: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-primary/20 shadow-[0_15px_35px_-10px_rgba(124,61,255,0.2)] cursor-default"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Code size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 tracking-wider font-bold">FOCUS</p>
                            <p className="text-slate-900 font-bold">Data Science</p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
