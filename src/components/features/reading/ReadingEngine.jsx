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
    const {
        pages,
        currentPageIndex,
        nextPage,
        prevPage,
        document,
        annotations,
        addAnnotation,
        fontSize,
        contentPadding,
        appMode
    } = useDocumentStore();
    const { accessToken } = useAuthStore();

    const currentPage = pages[currentPageIndex];
    const [showSidebar, setShowSidebar] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState(null);

    const containerRef = React.useRef(null);

    const handleSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !containerRef.current) return;

        const range = selection.getRangeAt(0);
        // Ensure the selection is within our text container
        if (!containerRef.current.contains(range.startContainer)) return;

        const offsets = HighlightingHelper.getSelectionOffsets(containerRef.current);
        if (offsets && (offsets.end - offsets.start) > 0) {
            setPendingHighlight({
                start: offsets.start,
                end: offsets.end,
                text: selection.toString()
            });
            setShowSidebar(true);

            // Clear browser selection to show our custom highlight
            selection.removeAllRanges();
        }
    };

    const closeSidebar = () => {
        setShowSidebar(false);
        setPendingHighlight(null);
        window.getSelection()?.removeAllRanges();
    };

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeSidebar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
        let highlights = pageAnnotations.flatMap(a => a.highlights || []);

        // Add pending highlight to the list for immediate feedback
        if (pendingHighlight) {
            highlights = [...highlights, pendingHighlight];
        }

        return (
            <>
                {HighlightingHelper.renderTextWithHighlights(currentPage.text, highlights)}
                {appMode === 'config' && (
                    <div className="mt-8 pt-4 border-t-2 border-dashed border-ink/20 dark:border-white/20 relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-paper dark:bg-background-dark text-[10px] uppercase tracking-[0.3em] font-bold text-ink/30 dark:text-white/30">
                            Page Boundary
                        </span>
                        <div className="opacity-10 dark:opacity-5">
                            {pages[currentPageIndex + 1]?.text?.split('\n').slice(0, 3).join('\n')}
                            <br />...
                        </div>
                    </div>
                )}
            </>
        );
    };

    if (!currentPage) return <div>No content</div>;

    return (
        <div className="min-h-screen bg-paper dark:bg-background-dark text-ink dark:text-gray-100 flex transition-colors duration-500">
            <div
                className={cn(
                    "flex-1 flex flex-col items-center py-20 px-8 transition-all duration-300",
                    showSidebar ? 'mr-0' : '',
                    appMode === 'config' && "opacity-40"
                )}
                onMouseUp={handleSelection}
            >
                <div
                    className="max-w-4xl w-full space-y-8"
                    style={{
                        paddingLeft: `${contentPadding}px`,
                        paddingRight: `${contentPadding}px`,
                        fontSize: `${fontSize}px`
                    }}
                >
                    <div
                        ref={containerRef}
                        className="font-serif leading-relaxed text-justify whitespace-pre-line"
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
                    onClose={closeSidebar}
                    onAddNote={handleAddNote}
                />
            )}

            {/* Controls */}
            {appMode !== 'config' && (
                <div className="fixed bottom-0 w-full p-4 bg-paper/80 dark:bg-background-dark/80 backdrop-blur-sm border-t border-ink/10 flex justify-between items-center px-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" disabled={currentPageIndex === 0} onClick={prevPage}>
                            <ArrowLeft size={16} className="mr-2" /> Prev
                        </Button>
                        <span className="text-sm font-sans tracking-widest text-ink-light">
                            PAGE {currentPageIndex + 1} / {pages.length}
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
            )}
        </div>
    );
};
