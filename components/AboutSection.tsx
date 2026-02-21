"use client";
import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section id="about" className="py-24 max-w-4xl mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-12"
            >
                <h2 className="text-4xl font-bold text-slate-900 font-heading">
                    <span className="text-primary italic mr-2">About</span> Me
                </h2>
                <div className="h-px bg-primary/10 flex-grow max-w-xs"></div>
            </motion.div>

            <div className="grid md:grid-cols-1 gap-12 text-slate-600 leading-relaxed">
                <div className="space-y-6">
                    <p className="font-bold text-slate-900 text-2xl leading-tight">
                        Data Analyst | BI Analyst | Data Engineer | Web Developer | Graphic Designer | Lecturer | Coding and Computer Science
                    </p>
                    <p className="text-lg">
                        Unlocking insights to drive business growth & social impact through data-driven decisions and creative problem-solving.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-accent/80 p-10 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(124,61,255,0.15)] border border-primary/20 backdrop-blur-sm"
                >
                    <ul className="space-y-6 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">✦</span>
                            <div>
                                <span className="text-slate-900 font-bold block mb-1 uppercase tracking-widest text-[10px]">Data Science</span>
                                Analysis, Visualization, ML Modeling, Generative AI, NLP, LLM's
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">✦</span>
                            <div>
                                <span className="text-slate-900 font-bold block mb-1 uppercase tracking-widest text-[10px]">Data Visualization & ETL</span>
                                Integration (SSIS), Storage/Warehousing, Cube/ROLAP (SSAS), Dashboard Development (Power BI/Tableau)
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">✦</span>
                            <div>
                                <span className="text-slate-900 font-bold block mb-1 uppercase tracking-widest text-[10px]">Graphic Designing</span>
                                Canva, Figma, Adobe Photoshop, Adobe Illustrator, Pixlr
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">✦</span>
                            <div>
                                <span className="text-slate-900 font-bold block mb-1 uppercase tracking-widest text-[10px]">Programming & Web</span>
                                Python, SQL, Java, C++, R, HTML, CSS, JavaScript, Next.js
                            </div>
                        </li>
                    </ul>
                </motion.div>

                <p className="font-bold text-primary text-center mt-6 text-xl italic">
                    Let's connect and explore opportunities to drive innovation together! 💡
                </p>
            </div>
        </section>
    );
}
