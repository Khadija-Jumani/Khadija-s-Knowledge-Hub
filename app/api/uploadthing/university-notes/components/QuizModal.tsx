"use client";

import React, { useState, useEffect } from "react";
import { X, BrainCircuit, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    noteId?: string;
    noteTitle?: string;
    isSubjectMode?: boolean;
    subject?: string;
    subjectNotes?: any[];
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizData {
    title: string;
    questions: Question[];
}

export default function QuizModal({ isOpen, onClose, noteId, noteTitle, isSubjectMode, subject, subjectNotes }: QuizModalProps) {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const shouldFetch = isSubjectMode
            ? isOpen && subject && subjectNotes && subjectNotes.length > 0 && !quiz
            : isOpen && noteId && !quiz;

        if (shouldFetch) {
            const fetchQuiz = async () => {
                setLoading(true);
                setError("");
                try {
                    const bodyPayload = isSubjectMode
                        ? { subject, notes: subjectNotes }
                        : { noteId };

                    const res = await fetch("/api/quiz", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bodyPayload),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || "Failed to generate quiz");
                    }

                    if (isMounted) setQuiz(data);
                } catch (err: any) {
                    if (isMounted) setError(err.message);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };
            fetchQuiz();
        }

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [isOpen, noteId, isSubjectMode, subject, subjectNotes]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setQuiz(null);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setShowResults(false);
                setError("");
            }, 300); // Wait for exit animation
        }
    }, [isOpen]);

    const handleOptionSelect = (option: string) => {
        if (showResults) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const calculateScore = () => {
        if (!quiz) return 0;
        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correctAnswer) score++;
        });
        return score;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <BrainCircuit size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                {isSubjectMode ? "Comprehensive Subject Quiz" : "AI Knowledge Check"}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 line-clamp-1">
                                {isSubjectMode ? subject : noteTitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 bg-white rounded-full shadow-sm hover:shadow"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-slate-50/30">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                            <Loader2 size={48} className="text-primary animate-spin mb-6" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Quiz...</h2>
                            <p className="text-slate-500 max-w-sm">
                                {isSubjectMode
                                    ? "Our AI is reading through multiple documents in this subject and crafting challenging questions to test your overall knowledge. This might take up to a minute."
                                    : "Our AI is reading the document and crafting challenging questions to test your knowledge. This might take up to a minute for large files."}
                            </p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <AlertCircle size={48} className="text-red-500 mb-4" />
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
                            <p className="text-red-600/80 max-w-md bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                                {error}
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {quiz && !loading && !showResults && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                                        </span>
                                        <div className="flex gap-1">
                                            {quiz.questions.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1.5 w-6 rounded-full transition-colors ${idx === currentQuestionIndex ? 'bg-primary' : idx < currentQuestionIndex ? 'bg-primary/40' : 'bg-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 leading-snug">
                                        {quiz.questions[currentQuestionIndex].question}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                                        const isSelected = selectedAnswers[currentQuestionIndex] === option;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(option)}
                                                className={`w-full text-left p-4 rounded-2xl border-2 transition-all group flex items-start gap-4 ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-slate-100 bg-white hover:border-primary/30 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-primary/50'
                                                    }`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                </div>
                                                <span className={`text-lg font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                                                    {option}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 flex justify-between items-center">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-3 rounded-full font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!selectedAnswers[currentQuestionIndex]}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {quiz && showResults && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="text-center mb-10">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 text-white text-4xl font-black mb-4 shadow-xl shadow-slate-900/20 border-4 border-slate-100">
                                    {calculateScore()}/{quiz.questions.length}
                                </div>
                                <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
                                <p className="text-slate-500">
                                    {calculateScore() >= quiz.questions.length * 0.8
                                        ? "Excellent work! You really understand this material."
                                        : calculateScore() >= quiz.questions.length * 0.5
                                            ? "Good effort! Review the explanations to master the concepts."
                                            : "Keep studying! Use this quiz to figure out what to review next."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-slate-800 text-xl border-b border-slate-200 pb-2">Review Your Answers</h3>
                                {quiz.questions.map((q, idx) => {
                                    const userAnswer = selectedAnswers[idx];
                                    const isCorrect = userAnswer === q.correctAnswer;

                                    return (
                                        <div key={idx} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                                            <div className="flex gap-3 items-start mb-4">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={24} />
                                                ) : (
                                                    <XCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-lg leading-snug">{q.question}</h4>

                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Answer</span>
                                                            <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{userAnswer || "No answer provided"}</span>
                                                        </div>

                                                        {!isCorrect && (
                                                            <div className="flex flex-col gap-1 mt-2">
                                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct Answer</span>
                                                                <span className="font-medium text-green-700">{q.correctAnswer}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                <div className="flex gap-2 items-start">
                                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded flex-shrink-0 mt-0.5">EXPLANATION</div>
                                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{q.explanation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
