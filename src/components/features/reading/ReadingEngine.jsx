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
        document: activeDocument,
        annotations,
        addAnnotation,
        fontSize,
        contentPadding,
        appMode,
        setLinesPerPage
    } = useDocumentStore();
    const { accessToken } = useAuthStore();

    const [showSidebar, setShowSidebar] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState(null);
    const textContainerRef = React.useRef(null);

    // Dynamic Paging Logic
    React.useEffect(() => {
        const calculateLines = () => {
            if (!textContainerRef.current) return;

            const availableHeight = textContainerRef.current.clientHeight;
            // Line height is roughly fontSize * 1.625
            const lineHeight = fontSize * 1.625;
            const targetLines = Math.max(5, Math.floor(availableHeight / lineHeight));

            if (targetLines !== useDocumentStore.getState().linesPerPage) {
                setLinesPerPage(targetLines);
            }
        };

        const observer = new ResizeObserver(calculateLines);
        if (textContainerRef.current) observer.observe(textContainerRef.current);

        calculateLines();
        return () => observer.disconnect();
    }, [fontSize, setLinesPerPage]);

    const handleSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !textContainerRef.current) return;

        const range = selection.getRangeAt(0);
        if (!textContainerRef.current.contains(range.startContainer)) return;

        const offsets = HighlightingHelper.getSelectionOffsets(textContainerRef.current);
        if (offsets && (offsets.end - offsets.start) > 0) {
            setPendingHighlight({
                start: offsets.start,
                end: offsets.end,
                text: selection.toString()
            });
            setShowSidebar(true);
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
            if (e.key === 'Escape') closeSidebar();
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

        if (accessToken && activeDocument) {
            const nextAnnotations = [...annotations, { ...newAnnotation, id: Date.now() }];
            try {
                await syncProgress(accessToken, activeDocument.title, {
                    last_page: currentPageIndex + 1,
                    total_pages: pages.length,
                    modified_at: new Date().toISOString(),
                    annotations: nextAnnotations,
                });
            } catch (e) { console.error(e); }
        }
    };

    const renderPageContent = () => {
        const currentPage = pages[currentPageIndex];
        if (!currentPage) return null;

        const pageAnnotations = annotations.filter(a => a.pageNumber === currentPageIndex + 1);
        let highlights = pageAnnotations.flatMap(a => a.highlights || []);

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

    const currentPage = pages[currentPageIndex];
    if (!currentPage) return <div>No content</div>;

    return (
        <div className="h-screen bg-paper dark:bg-background-dark text-ink dark:text-gray-100 flex transition-colors duration-500 overflow-hidden">
            <div
                className={cn(
                    "flex-1 flex flex-col items-center pt-24 pb-20 px-8 transition-all duration-300",
                    showSidebar ? 'mr-0' : '',
                    appMode === 'config' && "opacity-40"
                )}
                onMouseUp={handleSelection}
            >
                <div
                    ref={textContainerRef}
                    className="w-full max-w-2xl flex-1 flex flex-col justify-center overflow-hidden"
                    style={{
                        paddingLeft: `${contentPadding}px`,
                        paddingRight: `${contentPadding}px`,
                        fontSize: `${fontSize}px`
                    }}
                >
                    <div className="font-serif leading-relaxed text-justify whitespace-pre-line">
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
