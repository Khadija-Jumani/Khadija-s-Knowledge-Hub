"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Lock, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser, loginAdmin } from "@/app/actions";

export default function LoginPage() {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStudentLogin = async () => {
        setLoading(true);
        await loginUser();
        router.push("/");
        router.refresh();
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await loginAdmin(password);
            if (res.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(res.message || "Login failed");
                setLoading(false);
            }
        } catch (err) {
            setError("An error occurred");
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex items-center justify-center py-8 md:py-16">
            {/* The Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-5xl bg-[#1A1A2E] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-[#2A2A4A]"
            >
                {/* Left Panel: Form */}
                <div className="w-full md:w-[45%] p-10 md:p-14 flex flex-col relative z-20 bg-[#1A1A2E]">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-2 mb-12 text-white">
                        <Activity className="text-white" size={24} />
                        <span className="font-bold tracking-widest text-xs">UNIVERSITY NOTES</span>
                    </div>

                    <div className="flex-grow flex flex-col justify-center max-w-xs mx-auto w-full">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full border-2 border-cyan-400 mx-auto mb-10 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                            <User size={40} className="opacity-90" />
                        </div>

                        <AnimatePresence mode="wait">
                            {!isAdminMode ? (
                                <motion.div
                                    key="student-selection"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <button
                                        onClick={handleStudentLogin}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-slate-700 bg-transparent text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-400/10 transition-all font-medium text-sm group"
                                    >
                                        <User size={16} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                        Login as Student
                                    </button>

                                    <button
                                        onClick={() => setIsAdminMode(true)}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full border border-slate-700 bg-transparent text-slate-300 hover:text-white hover:border-pink-500 hover:bg-pink-500/10 transition-all font-medium text-sm group"
                                    >
                                        <Shield size={16} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                                        Login as Admin
                                    </button>

                                    <div className="text-center pt-8">
                                        <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
                                            NOT A MEMBER? <a href="#" className="text-white hover:underline">SIGN UP NOW</a>
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="admin-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleAdminLogin}
                                    className="space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                                <User size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                disabled
                                                value="Admin Portal"
                                                className="w-full bg-transparent border border-slate-700 text-slate-400 text-sm rounded-full py-3.5 pl-12 pr-4 cursor-not-allowed"
                                            />
                                        </div>

                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="****************"
                                                className="w-full bg-transparent border border-slate-700 text-white text-sm rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all placeholder:text-slate-700 placeholder:text-xs tracking-widest"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs text-center font-medium"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <div className="pt-2 flex flex-col gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading || !password}
                                            className="w-full bg-pink-600 hover:bg-pink-500 text-white rounded-full py-3.5 text-sm font-bold tracking-widest shadow-[0_0_20px_rgba(219,39,119,0.4)] disabled:opacity-50 transition-all"
                                        >
                                            {loading ? "VERIFYING..." : "LOGIN"}
                                        </button>

                                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold px-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAdminMode(false)}
                                                className="flex items-center gap-1 hover:text-white transition-colors"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-pink-600"></div>
                                                Remember me
                                            </button>
                                            <button type="button" onClick={() => setIsAdminMode(false)} className="hover:text-white transition-colors">
                                                Forgot your password? (Go Back)
                                            </button>
                                        </div>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Welcome Visual */}
                <div className="hidden md:flex flex-1 relative bg-[#151426] items-center justify-end p-16 overflow-hidden">
                    <img
                        src="/images/login-bg.png"
                        alt="Fluid background"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />

                    <div className="relative z-10 text-right mt-10">
                        <h2 className="text-6xl font-bold text-white mb-6 tracking-tight">Welcome.</h2>
                        <p className="text-[10px] text-slate-400 max-w-[200px] ml-auto leading-relaxed text-right tracking-widest opacity-80">
                            ACCESS YOUR ACADEMIC <br />
                            MATERIALS, QUIZZES, <br />
                            AND MORE.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
