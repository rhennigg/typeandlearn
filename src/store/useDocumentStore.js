import { create } from 'zustand';

const getVirtualLines = (text, maxChars = 80) => {
    if (!text) return [];
    return text.split('\n').flatMap(line => {
        if (!line.trim()) return [''];
        // Split specifically by characters while respecting word boundaries
        const regex = new RegExp(`.{1,${maxChars}}(\\s+|$)`, 'g');
        const chunks = line.match(regex);
        return chunks ? chunks.map(c => c.trimEnd()) : [line];
    });
};

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
    baseText: '',

    setAppMode: (mode) => set({ appMode: mode }),
    setDocument: (doc) => set({
        document: doc,
        appMode: 'config'
    }),

    setPages: (originalPages) => {
        const fullText = originalPages.map(p => p.text).join('\n');
        const lpp = 20;

        const virtualLines = getVirtualLines(fullText);
        const newPages = [];
        for (let i = 0; i < virtualLines.length; i += lpp) {
            newPages.push({
                pageNumber: Math.floor(i / lpp) + 1,
                text: virtualLines.slice(i, i + lpp).join('\n')
            });
        }

        set({
            pages: newPages,
            rawText: fullText,
            baseText: fullText,
            linesPerPage: lpp
        });
    },

    setLinesPerPage: (lpp) => set((state) => {
        const currentText = state.rawText;
        const virtualLines = getVirtualLines(currentText);

        const newPages = [];
        for (let i = 0; i < virtualLines.length; i += lpp) {
            newPages.push({
                pageNumber: Math.floor(i / lpp) + 1,
                text: virtualLines.slice(i, i + lpp).join('\n')
            });
        }

        // Maintain relative position
        const currentLineIndex = state.currentPageIndex * state.linesPerPage;
        const startLineIndex = state.startPageOffset * state.linesPerPage;

        const newPageIndex = Math.floor(currentLineIndex / lpp);
        const newStartOffset = Math.floor(startLineIndex / lpp);

        return {
            linesPerPage: lpp,
            pages: newPages,
            currentPageIndex: Math.min(newPageIndex, newPages.length - 1),
            startPageOffset: Math.min(newStartOffset, newPages.length - 1)
        };
    }),

    jumpToText: (phrase) => set((state) => {
        const sourceText = state.baseText || state.rawText;

        // If phrase is cleared or too short, restore original document
        if (!phrase || phrase.trim().length < 4) {
            if (state.rawText === state.baseText) return state;

            const virtualLines = getVirtualLines(sourceText);
            const newPages = [];
            for (let i = 0; i < virtualLines.length; i += state.linesPerPage) {
                newPages.push({
                    pageNumber: Math.floor(i / state.linesPerPage) + 1,
                    text: virtualLines.slice(i, i + state.linesPerPage).join('\n')
                });
            }

            return {
                rawText: sourceText,
                pages: newPages,
                currentPageIndex: 0,
                startPageOffset: 0
            };
        }

        const index = sourceText.toLowerCase().indexOf(phrase.toLowerCase());
        if (index === -1) return state;

        // Found phrase! Slice from that point
        const slicedText = sourceText.substring(index);
        const virtualLines = getVirtualLines(slicedText);

        const newPages = [];
        for (let i = 0; i < virtualLines.length; i += state.linesPerPage) {
            newPages.push({
                pageNumber: Math.floor(i / state.linesPerPage) + 1,
                text: virtualLines.slice(i, i + state.linesPerPage).join('\n')
            });
        }

        return {
            rawText: slicedText,
            pages: newPages,
            currentPageIndex: 0,
            startPageOffset: 0
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
        baseText: '',
        startPageOffset: 0,
        annotations: []
    }),
}));

export default useDocumentStore;
