import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import useDocumentStore from '@/store/useDocumentStore';
import useAuthStore from '@/store/useAuthStore';
import { TypingStats } from './TypingStats';
import { cn } from '@/lib/utils';
import { ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
import { syncProgress } from '@/services/driveSync';

export const TypingEngine = () => {
    const { pages, currentPageIndex, nextPage, prevPage, resetDocument, document } = useDocumentStore();
    const { accessToken } = useAuthStore();

    const currentPage = pages[currentPageIndex];

    // State
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [stats, setStats] = useState({ wpm: 0, accuracy: 100, errors: 0 });
    const [isComplete, setIsComplete] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const inputRef = useRef(null);
    const textRef = useRef(null);

    // Text to type
    const targetText = currentPage?.text || "";

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentPageIndex]);

    // Handle typing
    const handleInput = (e) => {
        if (isComplete) return;

        const value = e.target.value;
        const length = value.length;

        // Block if trying to type past end
        if (length > targetText.length) return;

        // Start timer on first char
        if (!startTime && length > 0) {
            setStartTime(Date.now());
        }

        setInput(value);

        // Calculate basic stats
        const errors = value.split('').reduce((acc, char, i) => {
            return char !== targetText[i] ? acc + 1 : acc;
        }, 0);

        // Update stats
        if (startTime) {
            const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
            const wpm = timeElapsed > 0 ? Math.round((length / 5) / timeElapsed) : 0;
            const accuracy = length > 0 ? Math.round(((length - errors) / length) * 100) : 100;

            setStats({ wpm, accuracy, errors });
        }

        // Check completion
        if (value.length === targetText.length) {
            setIsComplete(true);
            saveProgress({ wpm: stats.wpm, accuracy: stats.accuracy, errors: errors }, currentPageIndex);
        }
    };

    const saveProgress = async (finalStats, pageIndex) => {
        if (!accessToken || !document) return;

        setIsSyncing(true);
        try {
            const progressData = {
                last_page: pageIndex + 1,
                total_pages: document.totalPages,
                modified_at: new Date().toISOString(),
                stats: finalStats
            };

            await syncProgress(accessToken, document.title, progressData);
            console.log("Progress synced to Drive");
        } catch (error) {
            console.error("Failed to sync progress:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    // Render individual characters with formatting
    const renderText = () => {
        return targetText.split('').map((char, index) => {
            const typedChar = input[index];
            const isDark = document.documentElement?.classList.contains('dark');

            let statusClass = "text-ink/20 dark:text-gray-600"; // Default: Untyped

            if (typedChar !== undefined) {
                if (typedChar === char) {
                    statusClass = "text-ink opacity-100 dark:text-gray-100"; // Correct
                } else {
                    statusClass = "text-red-500 opacity-100 bg-red-100/50 dark:bg-red-900/30"; // Incorrect
                }
            } else if (index === input.length) {
                statusClass = "text-ink/20 dark:text-gray-600 border-l-2 border-primary animate-pulse pl-0.5"; // Cursor position
            }

            return (
                <span key={index} className={cn("transition-colors duration-75", statusClass)}>
                    {char}
                </span>
            );
        });
    };

    const handleNextPage = () => {
        // Reset state for next page
        setInput('');
        setStartTime(null);
        setStats({ wpm: 0, accuracy: 100, errors: 0 });
        setIsComplete(false);
        nextPage();
    };

    if (!currentPage) return <div>No page content found.</div>;

    return (
        <div className="relative min-h-screen bg-paper dark:bg-background-dark flex flex-col transition-colors duration-500">
            {/* Stats Sidebar */}
            <TypingStats stats={stats} />

            {/* Main Typing Area */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-20 flex flex-col justify-center items-center">
                <div
                    className="font-serif text-2xl md:text-3xl leading-relaxed tracking-wide text-justify outline-none select-none relative dark:text-gray-100"
                    onClick={() => inputRef.current?.focus()}
                >
                    {renderText()}
                </div>

                {/* Completion Actions */}
                {isComplete && (
                    <div className="mt-12 animate-fade-in-up flex gap-4 items-center">
                        <Button onClick={handleNextPage} size="lg" className="flex items-center gap-2">
                            Next Page <ArrowRight size={16} />
                        </Button>
                        {isSyncing ? (
                            <span className="text-xs text-ink-light animate-pulse">Syncing to Drive...</span>
                        ) : (
                            <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Saved</span>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden Input */}
            <textarea
                ref={inputRef}
                value={input}
                onChange={handleInput}
                className="absolute opacity-0 top-0 left-0 w-0 h-0 resize-none overflow-hidden"
                autoFocus
                spellCheck={false}
            />

            {/* Progress Footer */}
            <div className="fixed bottom-0 w-full h-1 bg-ink/10 dark:bg-gray-800">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(input.length / targetText.length) * 100}%` }}
                ></div>
            </div>

            <div className="fixed bottom-6 right-6 text-sm font-sans text-ink-light dark:text-gray-500">
                Page {currentPageIndex + 1} / {document.totalPages}
            </div>
        </div>
    );
};
