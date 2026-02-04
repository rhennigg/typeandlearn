import React from 'react';
import { Button } from '@/components/ui/Button';
import { Printer } from 'lucide-react';
import useDocumentStore from '@/store/useDocumentStore';

export const PDFExporter = () => {
    const { document, pages, annotations } = useDocumentStore();

    const handlePrint = () => {
        const printContent = window.open('', '', 'height=600,width=800');

        const htmlContent = `
            <html>
                <head>
                    <title>${document.title} - ActiveReader Export</title>
                    <style>
                        body { font-family: 'Merriweather', serif; padding: 40px; line-height: 1.6; color: #1a1a1a; }
                        h1 { font-family: 'Inter', sans-serif; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        .page-break { page-break-after: always; }
                        .annotation { 
                            background: #f9f9f9; 
                            border-left: 3px solid #2563EB; 
                            padding: 10px; 
                            margin: 20px 0; 
                            font-size: 14px;
                            font-family: 'Inter', sans-serif;
                        }
                        .tag { background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase; margin-right: 5px; }
                        .page-number { color: #888; font-size: 12px; margin-top: 20px; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>${document.title}</h1>
                    ${pages.map(page => {
            const pageNotes = annotations.filter(a => a.pageNumber === page.pageNumber);
            return `
                            <div class="page text-content">
                                <p>${page.text}</p>
                                
                                ${pageNotes.length > 0 ? `
                                    <div class="annotations-section">
                                        <h3>Notes</h3>
                                        ${pageNotes.map(note => `
                                            <div class="annotation">
                                                <p>${note.comment}</p>
                                                <div>${note.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="page-break"></div>
                        `;
        }).join('')}
                </body>
            </html>
        `;

        printContent.document.write(htmlContent);
        printContent.document.close();
        printContent.focus();
        setTimeout(() => printContent.print(), 500);
    };

    return (
        <Button onClick={handlePrint} variant="ghost" size="sm" className="hidden xl:flex items-center gap-2">
            <Printer size={16} /> Export PDF
        </Button>
    );
};
