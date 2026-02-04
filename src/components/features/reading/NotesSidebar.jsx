import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Tag } from 'lucide-react';

export const NotesSidebar = ({ annotations, onClose, onAddNote, pageIndex, pendingHighlight }) => {
    const [note, setNote] = useState('');
    const [activeTags, setActiveTags] = useState([]);

    const availableTags = ['#Idea', '#Question', '#Important', '#Quote'];

    const handleAdd = () => {
        if (!note.trim()) return;
        onAddNote({
            text: pendingHighlight ? pendingHighlight.text : "Page Note",
            comment: note,
            tags: activeTags,
            pageNumber: pageIndex + 1
        });
        setNote('');
        setActiveTags([]);
    };

    const toggleTag = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const pageAnnotations = annotations.filter(a => a.pageNumber === pageIndex + 1);

    return (
        <div className="fixed right-0 top-20 h-[calc(100vh-80px)] w-80 bg-paper dark:bg-background-dark border border-ink/10 shadow-xl z-40 p-6 flex flex-col font-sans overflow-hidden mr-4 rounded-lg transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold">Notes</h3>
                <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {pageAnnotations.length === 0 ? (
                    <p className="text-ink-light dark:text-gray-400 italic text-sm">No notes for this page.</p>
                ) : (
                    pageAnnotations.map((ann) => (
                        <Card key={ann.id} className="p-4 bg-white dark:bg-gray-800/50 text-sm text-ink dark:text-gray-200 shadow-sm border-ink/5">
                            <p className="mb-2 leading-relaxed">{ann.comment}</p>
                            <div className="flex flex-wrap gap-1">
                                {ann.tags.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wide bg-gray-100 dark:bg-gray-700 text-ink dark:text-gray-300 px-1.5 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-ink/10">
                {pendingHighlight && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-400 text-[11px] font-sans italic text-ink-light dark:text-yellow-200/70 line-clamp-2">
                        "{pendingHighlight.text}"
                    </div>
                )}
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write a thought..."
                    className="w-full h-24 p-3 text-sm bg-white dark:bg-gray-800 border-none focus:ring-1 focus:ring-ink dark:focus:ring-gray-600 resize-none rounded-sm transition-colors text-ink dark:text-gray-100 placeholder:opacity-50"
                />

                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded transition-colors ${activeTags.includes(tag)
                                ? 'bg-ink text-white dark:bg-gray-100 dark:text-ink'
                                : 'bg-gray-100 dark:bg-gray-700 text-ink dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <Button onClick={handleAdd} className="w-full">Add Note</Button>
            </div>
        </div>
    );
};
