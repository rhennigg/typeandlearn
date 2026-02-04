import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import useDocumentStore from '@/store/useDocumentStore';
import { Settings2, Type, Layout, Play, Search, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReadingConfigModal = ({ onConfirm, onCancel }) => {
    const {
        document: activeDocument,
        pages,
        fontSize, setFontSize,
        contentPadding, setContentPadding,
        startPageOffset, setStartPageOffset,
        linesPerPage, setLinesPerPage,
        setCurrentPageIndex,
        resetDocument,
        rawText,
        jumpToText
    } = useDocumentStore();

    const [searchPhrase, setSearchPhrase] = React.useState('');
    const [matchStatus, setMatchStatus] = React.useState('idle'); // 'idle', 'found', 'not_found'

    if (!activeDocument) return null;

    const handleStart = () => {
        setCurrentPageIndex(startPageOffset);
        onConfirm();
    };

    const handleCancel = () => {
        resetDocument();
        onCancel();
    };

    const handleSearch = (phrase) => {
        setSearchPhrase(phrase);
        if (phrase.trim().length >= 4) {
            const found = rawText.toLowerCase().includes(phrase.toLowerCase());
            if (found) {
                jumpToText(phrase);
                setMatchStatus('found');
            } else {
                setMatchStatus('not_found');
            }
        } else {
            setMatchStatus('idle');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background-dark/60 backdrop-blur-md animate-fade-in px-4">
            <Card className="w-full max-w-lg p-10 bg-paper dark:bg-background-dark shadow-2xl space-y-8 border-ink/10 relative overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-ink opacity-10"></div>

                <header className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-ink/5 rounded-sm">
                                <Settings2 className="w-5 h-5 text-ink dark:text-gray-300" />
                            </div>
                            <h2 className="font-display text-3xl font-bold tracking-tight">Configure Reading</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="text-[10px] opacity-50 hover:opacity-100 uppercase tracking-widest">Cancel</Button>
                    </div>
                    <p className="text-sm font-sans text-ink-light leading-relaxed">
                        Tailor the flow of <span className="text-ink font-semibold dark:text-gray-200">"{activeDocument.title}"</span> to your learning style.
                    </p>
                </header>

                <div className="space-y-8 py-2">
                    {/* Font Size Row */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-light flex items-center gap-2">
                                <Type size={12} /> Font Size
                            </label>
                            <span className="font-sans text-xs font-semibold">{fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="14" max="42" step="1"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-full h-1 bg-ink/10 rounded-full appearance-none cursor-pointer accent-ink dark:bg-gray-700"
                        />
                        <p className="text-[10px] text-ink-light/60 font-sans italic">Pages will automatically adjust to fit your screen.</p>
                    </div>

                    {/* Smart Start Point Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-ink-light flex items-center gap-2">
                                <Search size={12} /> Find Starting Point
                            </label>
                            {matchStatus === 'found' && <span className="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1"><CheckCircle2 size={10} /> Match Found</span>}
                            {matchStatus === 'not_found' && <span className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1"><AlertCircle size={10} /> Phrase not found</span>}
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Paste the starting phrase or sentence..."
                                value={searchPhrase}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-ink/[0.03] dark:bg-white/[0.03] border border-ink/10 dark:border-white/10 rounded-sm py-3 px-4 text-sm font-sans focus:outline-none focus:border-ink/30 transition-all italic"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-[10px] uppercase tracking-widest text-ink/40">
                                    <span>Manual Adjust</span>
                                    <span>Page {startPageOffset + 1}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max={pages.length - 1} step="1"
                                    value={startPageOffset}
                                    onChange={(e) => setStartPageOffset(parseInt(e.target.value))}
                                    className="w-full h-1 bg-ink/10 rounded-full appearance-none cursor-pointer accent-ink dark:bg-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                    <Button onClick={handleStart} size="lg" className="w-full text-sm tracking-widest py-6">
                        Confirm & Start Session
                    </Button>
                </div>
            </Card>
        </div>,
        window.document.body
    );
};
