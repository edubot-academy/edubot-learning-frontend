import React from 'react';

const TOKEN_REGEX = /(\*\*[^*]+\*\*|`[^`]+`)/g;

const parseInlineRichText = (text = '') => {
    if (!text) return [];

    return text.split(TOKEN_REGEX).filter(Boolean).map((chunk, idx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
            return {
                id: `bold-${idx}`,
                type: 'bold',
                text: chunk.slice(2, -2),
            };
        }

        if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
            return {
                id: `code-${idx}`,
                type: 'code',
                text: chunk.slice(1, -1),
            };
        }

        return {
            id: `text-${idx}`,
            type: 'text',
            text: chunk,
        };
    });
};

const InlineRichText = ({ text = '', className = '' }) => {
    const segments = parseInlineRichText(text);

    if (!segments.length) {
        return null;
    }

    return (
        <span className={`whitespace-pre-wrap ${className}`.trim()}>
            {segments.map((segment) => {
                if (segment.type === 'bold') {
                    return <strong key={segment.id}>{segment.text}</strong>;
                }

                if (segment.type === 'code') {
                    return (
                        <code
                            key={segment.id}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-900 font-mono text-[0.95em]"
                        >
                            {segment.text}
                        </code>
                    );
                }

                return <span key={segment.id}>{segment.text}</span>;
            })}
        </span>
    );
};

export default InlineRichText;
