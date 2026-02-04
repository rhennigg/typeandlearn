import { create } from 'zustand';

const useDocumentStore = create((set) => ({
    document: null, // { id, title, totalPages }
    pages: [], // Array of { pageNumber, text }
    annotations: [], // Array of { pageNumber, text, comment, tags, id, highlights: Array<{start, end, text}> }
    currentPageIndex: 0,
    isProcessing: false,
    fontSize: 20,
    contentPadding: 80,
    startPageOffset: 0,
    linesPerPage: 15,
    appMode: 'idle', // 'idle', 'config', 'reading', 'typing'
    rawText: '',

    setAppMode: (mode) => set({ appMode: mode }),
    setDocument: (doc) => set({
        document: doc,
        appMode: 'config'
    }),

    setPages: (originalPages) => {
        const fullText = originalPages.map(p => p.text).join('\n');
        const lines = fullText.split('\n').filter(line => line.trim().length > 0);

        const newPages = [];
        const lpp = 20; // Default or current state value
        for (let i = 0; i < lines.length; i += lpp) {
            newPages.push({
                pageNumber: Math.floor(i / lpp) + 1,
                text: lines.slice(i, i + lpp).join('\n')
            });
        }

        set({
            pages: newPages,
            rawText: fullText,
            linesPerPage: lpp
        });
    },

    setLinesPerPage: (lpp) => set((state) => {
        const lines = state.rawText.split('\n').filter(line => line.trim().length > 0);
        const newPages = [];
        for (let i = 0; i < lines.length; i += lpp) {
            newPages.push({
                pageNumber: Math.floor(i / lpp) + 1,
                text: lines.slice(i, i + lpp).join('\n')
            });
        }
        return {
            linesPerPage: lpp,
            pages: newPages,
            // Reset current page if it's out of bounds after re-pagination
            currentPageIndex: Math.min(state.currentPageIndex, newPages.length - 1)
        };
    }),

    jumpToText: (phrase) => set((state) => {
        if (!phrase || phrase.trim().length < 4) return state;

        const fullText = state.rawText;
        const index = fullText.toLowerCase().indexOf(phrase.toLowerCase());

        if (index === -1) return state;

        // Calculate line number up to the matched phrase
        const textBefore = fullText.substring(0, index);
        const lineCountBefore = textBefore.split('\n').filter(line => line.trim().length > 0).length;

        // Calculate page index
        const targetPageIndex = Math.floor(lineCountBefore / state.linesPerPage);

        return {
            currentPageIndex: Math.min(targetPageIndex, state.pages.length - 1),
            startPageOffset: Math.min(targetPageIndex, state.pages.length - 1)
        };
    }),

    setIsProcessing: (isProcessing) => set({ isProcessing }),
    setFontSize: (fontSize) => set({ fontSize }),
    setContentPadding: (contentPadding) => set({ contentPadding }),
    setStartPageOffset: (startPageOffset) => set({ startPageOffset }),
    setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

    addAnnotation: (annotation) => set((state) => ({
        annotations: [...state.annotations, { ...annotation, id: Date.now() }]
    })),

    setAnnotations: (annotations) => set({ annotations }),

    nextPage: () => set((state) => ({
        currentPageIndex: Math.min(state.currentPageIndex + 1, state.pages.length - 1)
    })),

    prevPage: () => set((state) => ({
        currentPageIndex: Math.max(state.currentPageIndex - 1, state.startPageOffset)
    })),

    resetDocument: () => set({
        document: null,
        pages: [],
        appMode: 'idle',
        currentPageIndex: 0,
        rawText: '',
        startPageOffset: 0,
        annotations: []
    }),
}));

export default useDocumentStore;
