import { create } from 'zustand';

const useDocumentStore = create((set) => ({
    document: null, // { id, title, totalPages }
    pages: [], // Array of { pageNumber, text }
    annotations: [], // Array of { pageNumber, text, comment, tags, id }
    currentPageIndex: 0,
    isProcessing: false,

    setDocument: (doc) => set({ document: doc }),
    setPages: (pages) => set({ pages }),
    setIsProcessing: (isProcessing) => set({ isProcessing }),

    addAnnotation: (annotation) => set((state) => ({
        annotations: [...state.annotations, { ...annotation, id: Date.now() }]
    })),

    setAnnotations: (annotations) => set({ annotations }),

    nextPage: () => set((state) => ({
        currentPageIndex: Math.min(state.currentPageIndex + 1, state.pages.length - 1)
    })),

    prevPage: () => set((state) => ({
        currentPageIndex: Math.max(state.currentPageIndex - 1, 0)
    })),

    resetDocument: () => set({ document: null, pages: [], currentPageIndex: 0 }),
}));

export default useDocumentStore;
