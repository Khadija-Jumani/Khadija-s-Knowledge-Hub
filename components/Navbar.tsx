"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Notes", href: "#notes" },
    { name: "About", href: "#about" },
    { name: "Feedback", href: "#feedback" },
    { name: "Contact", href: "#contact" },
];

import { checkAdminStatus, checkUserStatus, logoutAdmin } from "@/app/actions";
import UploadModal from "./UploadModal";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUser, setIsUser] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            const adminStatus = await checkAdminStatus();
            const userStatus = await checkUserStatus();
            setIsAdmin(adminStatus);
            setIsUser(userStatus);
        };

        // Initial check
        checkAuth();

        // Polling to catch login state changes across navigations
        const intervalId = setInterval(checkAuth, 2000);

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(intervalId);
        };
    }, []);

    const handleLogout = async () => {
        await logoutAdmin();
        setIsAdmin(false);
        setIsUser(false);
        window.location.href = "/login";
    };





    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 w-full z-50 transition-all duration-300 ease-in-out px-6 py-4 flex justify-between items-center",
                    scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm py-3 border-b border-primary/10" : "bg-transparent py-5"
                )}
            >
                <div className="flex flex-col">
                    <Link href="/" className="text-2xl font-bold font-heading text-primary relative group">
                        Khadija's Knowledge Hub
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                    </Link>
                    {isAdmin ? (
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 ml-0.5">Admin Mode</span>
                    ) : isUser ? (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 ml-0.5">Student Mode</span>
                    ) : null}
                </div>

                {/* Desktop Nav */}
                {pathname !== "/login" && (
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link, index) => (
                            <motion.div
                                key={link.name}
                                whileHover={{ scale: 1.1, y: -2 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Link
                                    href={link.href}
                                    className="text-sm font-medium text-slate-600 hover:text-primary transition-colors relative"
                                >
                                    <span className="text-primary mr-1">0{index + 1}.</span> {link.name}
                                </Link>
                            </motion.div>
                        ))}
                        {isAdmin ? (
                            <div className="flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    onClick={() => setIsUploadOpen(true)}
                                    className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                                >
                                    Upload Note
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    onClick={handleLogout}
                                    className="text-sm font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                >
                                    Logout
                                </motion.button>
                            </div>
                        ) : isUser ? (
                            <div className="flex items-center">
                                <motion.button
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    onClick={handleLogout}
                                    className="text-sm font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                >
                                    Logout
                                </motion.button>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <motion.div whileHover={{ scale: 1.1, y: -2 }}>
                                    <Link
                                        href="/login"
                                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                                    >
                                        Login
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}

                {/* Mobile Menu Button */}
                {pathname !== "/login" && (
                    <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                )}

                {/* Mobile Nav Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="fixed inset-0 top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 z-40 md:hidden"
                        >
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-heading font-medium text-slate-900 hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {isAdmin ? (
                                <>
                                    <button
                                        onClick={() => { setIsOpen(false); setIsUploadOpen(true); }}
                                        className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-colors"
                                    >
                                        Upload Note
                                    </button>
                                    <button
                                        onClick={() => { setIsOpen(false); handleLogout(); }}
                                        className="text-xl font-heading font-medium text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : isUser ? (
                                <>
                                    <button
                                        onClick={() => { setIsOpen(false); handleLogout(); }}
                                        className="text-xl font-heading font-medium text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-xl font-heading font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </>
    );
}
