import { pdfjs } from 'react-pdf';

// Configure worker for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;

        const numPages = pdf.numPages;
        const pages = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Basic text stitching - needs refinement for complex layouts
            const pageText = textContent.items
                .map((item) => item.str)
                .join(' ')
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            if (pageText.length > 0) {
                pages.push({
                    pageNumber: i,
                    text: pageText
                });
            }
        }

        return {
            metadata: {
                title: file.name.replace('.pdf', ''),
                totalPages: numPages,
            },
            pages: pages
        };

    } catch (error) {
        console.error("PDF Parse Error:", error);
        throw new Error("Failed to parse PDF");
    }
};
