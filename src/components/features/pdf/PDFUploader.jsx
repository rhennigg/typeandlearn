import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '@/services/pdfParser';
import useDocumentStore from '@/store/useDocumentStore';
import useAuthStore from '@/store/useAuthStore';
import { loadProgress } from '@/services/driveSync';

export const PDFUploader = () => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState(null);
    const { setDocument, setPages, setIsProcessing, isProcessing, setAnnotations } = useDocumentStore();
    const { accessToken } = useAuthStore();


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError("Please upload a valid PDF file.");
            return;
        }

        try {
            setError(null);
            setIsProcessing(true);

            const { metadata, pages } = await extractTextFromPDF(file);

            if (pages.length === 0) {
                throw new Error("No text extraction possible. Is this an image-only PDF?");
            }

            setDocument(metadata);
            setPages(pages);

            // Try to load progress
            if (accessToken) {
                console.log("Checking for saved progress...");
                const savedData = await loadProgress(accessToken, metadata.title);
                if (savedData) {
                    console.log("Progress found!", savedData);
                    if (savedData.annotations) setAnnotations(savedData.annotations);
                    // Could also restore page index here if we want
                }
            }

        } catch (err) {
            setError(err.message || "Failed to process PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto p-8 border-dashed border-2 border-ink/20 bg-background-light/50 hover:bg-background-light transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-ink/5 rounded-full">
                    {isProcStore ? (
                        <Loader2 className="w-8 h-8 animate-spin text-ink" />
                    ) : (
                        <Upload className="w-8 h-8 text-ink" />
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="font-display text-lg font-semibold">Upload Document</h3>
                    <p className="text-sm font-sans text-ink-light">
                        Select a PDF to start reading and typing.
                    </p>
                </div>

                {error && (
                    <p className="text-xs text-red-500 font-sans">{error}</p>
                )}

                <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcStore}
                >
                    {isProcStore ? "Processing..." : "Select PDF"}
                </Button>
            </div>
        </Card>
    );
};
