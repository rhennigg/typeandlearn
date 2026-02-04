import React from 'react';

export const HighlightingHelper = {
    /**
     * Calculates the global start and end offsets of a selection relative to a container node.
     * Handles nested elements correctly.
     */
    getSelectionOffsets: (container) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(container);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length
        };
    },

    /**
     * Renders text with <mark> tags for the given highlight ranges.
     * Handles overlapping or sequential highlights by sorting and partitioning.
     */
    renderTextWithHighlights: (text, highlights) => {
        if (!highlights || highlights.length === 0) return text;

        // Sort highlights by start offset
        const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

        // Merge overlapping or adjacent highlights for cleaner rendering
        const merged = [];
        if (sortedHighlights.length > 0) {
            let current = { ...sortedHighlights[0] };
            for (let i = 1; i < sortedHighlights.length; i++) {
                const next = sortedHighlights[i];
                if (next.start <= current.end) {
                    current.end = Math.max(current.end, next.end);
                } else {
                    merged.push(current);
                    current = { ...next };
                }
            }
            merged.push(current);
        }

        const segments = [];
        let lastIndex = 0;

        merged.forEach((h, i) => {
            // Add text before highlight
            if (h.start > lastIndex) {
                segments.push(text.substring(lastIndex, h.start));
            }
            // Add highlighted text
            segments.push(
                <mark key={`h-${i}`} className="highlight">
                    {text.substring(h.start, h.end)}
                </mark>
            );
            lastIndex = h.end;
        });

        // Add remaining text
        if (lastIndex < text.length) {
            segments.push(text.substring(lastIndex));
        }

        return segments;
    }
};
