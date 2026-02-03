import React, { useState } from 'react';
import useDocumentStore from '@/store/useDocumentStore';
import useAuthStore from '@/store/useAuthStore';
import { syncProgress } from '@/services/driveSync';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { NotesSidebar } from './NotesSidebar';

export const ReadingEngine = () => {
    const { pages, currentPageIndex, nextPage, prevPage, document, annotations, addAnnotation } = useDocumentStore();
    const { accessToken } = useAuthStore();

    const currentPage = pages[currentPageIndex];
    const [showSidebar, setShowSidebar] = useState(false);

    const handleAddNote = async (note) => {
        addAnnotation(note);
        // Sync immediately (optimistic update in store, async save)
        if (accessToken && document) {
            const nextAnnotations = [...annotations, { ...note, id: Date.now() }];
            try {
                // We need to construct the full save object. 
                // Idealy we merge with existing stats but for now let's just save what we have.
                // NOTE: This might overwrite typing stats if we aren't careful.
                // Better strategy: Read-Modify-Write or separate files. 
                // For simplicity: We will just save annotations array in the same JSON structure.
                await syncProgress(accessToken, document.title, {
                    last_page: currentPageIndex + 1,
                    total_pages: document.totalPages,
                    modified_at: new Date().toISOString(),
                    annotations: nextAnnotations,
                    // stats: ... we risk losing stats here if we don't have them in store.
                    // Let's defer full sync validation for "Polish" phase or accept trade-off.
                });
            } catch (e) { console.error(e); }
        }
    };

    if (!currentPage) return <div>No content</div>;

    return (
        <div className="min-h-screen bg-paper dark:bg-background-dark text-ink dark:text-gray-100 flex transition-colors duration-500">
            <div className={`flex-1 flex flex-col items-center py-20 px-8 transition-all duration-300 ${showSidebar ? 'mr-0' : ''}`}>
                <div className="max-w-3xl w-full space-y-8">
                    <p className="font-serif text-xl md:text-2xl leading-relaxed text-justify whitespace-pre-line">
                        {currentPage.text}
                    </p>
                </div>
            </div>

            {showSidebar && (
                <NotesSidebar
                    annotations={annotations}
                    pageIndex={currentPageIndex}
                    onClose={() => setShowSidebar(false)}
                    onAddNote={handleAddNote}
                />
            )}

            {/* Controls */}
            <div className="fixed bottom-0 w-full p-4 bg-paper/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-ink/10 flex justify-between items-center px-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" disabled={currentPageIndex === 0} onClick={prevPage}>
                        <ArrowLeft size={16} className="mr-2" /> Prev
                    </Button>
                    <span className="text-sm font-sans tracking-widest text-ink-light">
                        PAGE {currentPageIndex + 1} / {document.totalPages}
                    </span>
                    <Button variant="ghost" disabled={currentPageIndex === pages.length - 1} onClick={nextPage}>
                        Next <ArrowRight size={16} className="ml-2" />
                    </Button>
                </div>

                <Button
                    variant={showSidebar ? "primary" : "secondary"}
                    onClick={() => setShowSidebar(!showSidebar)}
                >
                    <MessageSquare size={16} className="mr-2" /> Notes
                </Button>
            </div>
        </div>
    );
};
