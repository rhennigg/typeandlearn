import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Tag } from 'lucide-react';

export const NotesSidebar = ({ annotations, onClose, onAddNote, pageIndex }) => {
    const [note, setNote] = useState('');
    const [activeTags, setActiveTags] = useState([]);

    const availableTags = ['#Idea', '#Question', '#Important', '#Quote'];

    const handleAdd = () => {
        if (!note.trim()) return;
        onAddNote({
            text: "Page Note", // Generic anchor for now, selection is harder
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
        <div className="fixed right-0 top-0 h-full w-80 bg-paper border-l border-ink/10 shadow-xl z-40 p-6 flex flex-col font-sans overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold">Notes</h3>
                <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {pageAnnotations.length === 0 ? (
                    <p className="text-ink-light italic text-sm">No notes for this page.</p>
                ) : (
                    pageAnnotations.map((ann) => (
                        <Card key={ann.id} className="p-4 bg-white dark:bg-gray-800 text-sm shadow-sm">
                            <p className="mb-2">{ann.comment}</p>
                            <div className="flex flex-wrap gap-1">
                                {ann.tags.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase tracking-wide bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-ink/10">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write a thought..."
                    className="w-full h-24 p-3 text-sm bg-white dark:bg-gray-800 border-none focus:ring-1 focus:ring-ink resize-none rounded-sm"
                />

                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded transition-colors ${activeTags.includes(tag) ? 'bg-ink text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
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
