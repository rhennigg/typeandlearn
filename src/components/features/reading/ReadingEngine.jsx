import React, { useState } from 'react';
import useDocumentStore from '@/store/useDocumentStore';
import useAuthStore from '@/store/useAuthStore';
import { syncProgress } from '@/services/driveSync';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { NotesSidebar } from './NotesSidebar';
import { cn } from '@/lib/utils';
import { HighlightingHelper } from './HighlightingHelper'; // We'll create this

export const ReadingEngine = () => {
    const { pages, currentPageIndex, nextPage, prevPage, document, annotations, addAnnotation } = useDocumentStore();
    const { accessToken } = useAuthStore();

    const currentPage = pages[currentPageIndex];
    const [showSidebar, setShowSidebar] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState(null);

    const containerRef = React.useRef(null);

    const handleSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !containerRef.current) return;

        const range = selection.getRangeAt(0);
        if (!containerRef.current.contains(range.commonAncestorContainer)) return;

        // Calculate offsets relative to the text content
        const offsets = HighlightingHelper.getSelectionOffsets(containerRef.current);
        if (offsets) {
            setPendingHighlight({
                start: offsets.start,
                end: offsets.end,
                text: selection.toString()
            });
            setShowSidebar(true);
        }
    };

    const handleAddNote = async (noteContent) => {
        const newAnnotation = {
            ...noteContent,
            highlights: pendingHighlight ? [pendingHighlight] : []
        };

        addAnnotation(newAnnotation);
        setPendingHighlight(null);

        // Sync immediately
        if (accessToken && document) {
            const nextAnnotations = [...annotations, { ...newAnnotation, id: Date.now() }];
            try {
                await syncProgress(accessToken, document.title, {
                    last_page: currentPageIndex + 1,
                    total_pages: document.totalPages,
                    modified_at: new Date().toISOString(),
                    annotations: nextAnnotations,
                });
            } catch (e) { console.error(e); }
        }
    };

    const renderPageContent = () => {
        if (!currentPage) return null;

        const pageAnnotations = annotations.filter(a => a.pageNumber === currentPageIndex + 1);
        const highlights = pageAnnotations.flatMap(a => a.highlights || []);

        return HighlightingHelper.renderTextWithHighlights(currentPage.text, highlights);
    };

    if (!currentPage) return <div>No content</div>;

    return (
        <div className="min-h-screen bg-paper dark:bg-background-dark text-ink dark:text-gray-100 flex transition-colors duration-500">
            <div
                className={`flex-1 flex flex-col items-center py-20 px-8 transition-all duration-300 ${showSidebar ? 'mr-0' : ''}`}
                onMouseUp={handleSelection}
            >
                <div className="max-w-3xl w-full space-y-8">
                    <div
                        ref={containerRef}
                        className="font-serif text-xl md:text-2xl leading-relaxed text-justify whitespace-pre-line"
                    >
                        {renderPageContent()}
                    </div>
                </div>
            </div>

            {showSidebar && (
                <NotesSidebar
                    annotations={annotations}
                    pageIndex={currentPageIndex}
                    pendingHighlight={pendingHighlight}
                    onClose={() => {
                        setShowSidebar(false);
                        setPendingHighlight(null);
                    }}
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
