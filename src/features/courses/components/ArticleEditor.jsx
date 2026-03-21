import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaListOl,
    FaListUl,
    FaLink,
    FaUnlink,
    FaUndo,
    FaRedo,
    FaEraser,
    FaCode,
    FaQuoteLeft,
} from 'react-icons/fa';

const TOOLBAR_GROUPS = [
    [
        { label: 'H1', command: 'formatBlock', value: 'H1' },
        { label: 'H2', command: 'formatBlock', value: 'H2' },
        { label: 'H3', command: 'formatBlock', value: 'H3' },
        { label: 'H4', command: 'formatBlock', value: 'H4' },
        { label: 'P', command: 'formatBlock', value: 'P' },
    ],
    [
        { icon: <FaBold />, command: 'bold', title: 'Bold' },
        { icon: <FaItalic />, command: 'italic', title: 'Italic' },
        { icon: <FaUnderline />, command: 'underline', title: 'Underline' },
    ],
    [
        { icon: <FaListUl />, command: 'insertUnorderedList', title: 'Bulleted list' },
        { icon: <FaListOl />, command: 'insertOrderedList', title: 'Numbered list' },
        { icon: <FaQuoteLeft />, command: 'formatBlock', value: 'BLOCKQUOTE', title: 'Quote' },
        { icon: <FaCode />, command: 'formatBlock', value: 'PRE', title: 'Code block' },
    ],
    [
        { icon: <FaLink />, command: 'createLink', title: 'Insert link' },
        { icon: <FaUnlink />, command: 'unlink', title: 'Remove link' },
    ],
    [
        { icon: <FaUndo />, command: 'undo', title: 'Undo' },
        { icon: <FaRedo />, command: 'redo', title: 'Redo' },
        { icon: <FaEraser />, command: 'removeFormat', title: 'Clear format' },
    ],
];

const DEFAULT_FORMATS = {
    block: 'P',
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    quote: false,
    code: false,
    hasLink: false,
};

const normalizeBlockValue = (value) => value?.replace(/[<>]/g, '').toUpperCase() || 'P';

const ensureUrl = (rawUrl = '') => {
    const value = rawUrl.trim();
    if (!value) return null;

    if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value)) {
        return value;
    }

    return `https://${value}`;
};

const sanitizeEditorHtml = (html = '') =>
    DOMPurify.sanitize(html, {
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/)/i,
    });

const ArticleEditor = ({
    value = '',
    onChange,
    placeholder = 'Макаланын текстин бул жерге жазыңыз...',
    disabled = false,
}) => {
    const editorRef = useRef(null);

    const showPlaceholder = useMemo(() => {
        if (!value) return true;
        const stripped = value.replace(/<[^>]*>/g, '').trim();
        return stripped.length === 0;
    }, [value]);

    const [activeFormats, setActiveFormats] = useState({ ...DEFAULT_FORMATS });

    useEffect(() => {
        if (!editorRef.current) return;
        const sanitizedValue = sanitizeEditorHtml(value || '');
        if (editorRef.current.innerHTML !== sanitizedValue) {
            editorRef.current.innerHTML = sanitizedValue;
        }
    }, [value]);

    const isNodeInsideEditor = useCallback((node) => {
        if (!editorRef.current || !node) return false;
        const textNodeType = typeof Node !== 'undefined' ? Node.TEXT_NODE : 3;
        const elementNode = node.nodeType === textNodeType ? node.parentNode : node;
        return editorRef.current.contains(elementNode);
    }, []);

    const emitChange = () => {
        if (!onChange || !editorRef.current) return;
        const sanitized = sanitizeEditorHtml(editorRef.current.innerHTML);
        if (editorRef.current.innerHTML !== sanitized) {
            editorRef.current.innerHTML = sanitized;
        }
        onChange(sanitized);
    };

    const refreshActiveFormats = useCallback(() => {
        if (typeof document === 'undefined' || !editorRef.current) return;

        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0 || !isNodeInsideEditor(selection.anchorNode)) {
            setActiveFormats({ ...DEFAULT_FORMATS });
            return;
        }

        const blockValue = normalizeBlockValue(document.queryCommandValue('formatBlock'));

        const anchorNode =
            selection.anchorNode?.nodeType === Node.TEXT_NODE
                ? selection.anchorNode.parentElement
                : selection.anchorNode;

        setActiveFormats({
            block: blockValue,
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
            quote: blockValue === 'BLOCKQUOTE',
            code: blockValue === 'PRE',
            hasLink: Boolean(anchorNode?.closest?.('a')),
        });
    }, [isNodeInsideEditor]);

    useEffect(() => {
        refreshActiveFormats();
    }, [refreshActiveFormats, value]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const handler = () => refreshActiveFormats();
        document.addEventListener('selectionchange', handler);
        return () => document.removeEventListener('selectionchange', handler);
    }, [refreshActiveFormats]);

    const handleCommand = (command, commandValue) => {
        if (disabled || typeof document === 'undefined') return;

        if (command === 'createLink') {
            if (typeof window === 'undefined') return;
            const rawUrl = window.prompt('Шилтемени жазыңыз (https://...)');
            const normalized = ensureUrl(rawUrl || '');
            if (!normalized) return;

            const selection = window.getSelection();
            if (!selection) return;

            if (selection.isCollapsed) {
                const linkText = window.prompt('Шилтеменин тексти');
                if (!linkText) return;
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                if (!range) return;
                const textNode = document.createTextNode(linkText);
                range.insertNode(textNode);
                selection.removeAllRanges();
                const textRange = document.createRange();
                textRange.selectNodeContents(textNode);
                selection.addRange(textRange);
            }

            document.execCommand('createLink', false, normalized);
        } else {
            document.execCommand(command, false, commandValue || null);
        }

        editorRef.current?.focus();
        emitChange();
        refreshActiveFormats();
    };

    const handlePaste = (e) => {
        if (!editorRef.current) return;
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        if (typeof document !== 'undefined') {
            document.execCommand('insertText', false, text);
        }
        emitChange();
    };

    const isButtonActive = (button) => {
        switch (button.command) {
            case 'formatBlock': {
                const expected = normalizeBlockValue(button.value || 'P');
                return activeFormats.block === expected;
            }
            case 'bold':
                return activeFormats.bold;
            case 'italic':
                return activeFormats.italic;
            case 'underline':
                return activeFormats.underline;
            case 'insertUnorderedList':
                return activeFormats.unorderedList;
            case 'insertOrderedList':
                return activeFormats.orderedList;
            case 'unlink':
                return activeFormats.hasLink;
            default:
                return false;
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                    {TOOLBAR_GROUPS.map((group, groupIdx) => (
                        <div
                            key={`group-${groupIdx}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
                        >
                            {group.map(({ label, icon, command, value: commandValue, title }) => (
                                <button
                                    type="button"
                                    key={`${command}-${label || title || commandValue || ''}`}
                                    onClick={() => handleCommand(command, commandValue)}
                                    title={title || label}
                                    className={`h-8 min-w-8 px-2 text-sm rounded-md flex items-center justify-center transition ${
                                        isButtonActive({ command, value: commandValue })
                                            ? 'bg-edubot-orange text-white'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                    disabled={disabled}
                                >
                                    {icon || label}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                    Кеңеш: `Ctrl/Cmd + B` калың, `Ctrl/Cmd + I` курсив. Код үчүн `&lt;/&gt;` баскычы.
                </p>
            </div>

            <div className="relative p-3">
                {showPlaceholder && (
                    <span className="absolute top-6 left-6 text-slate-400 pointer-events-none select-none">
                        {placeholder}
                    </span>
                )}

                <div
                    ref={editorRef}
                    className={`article-editor-content min-h-[260px] rounded-lg border border-slate-200 bg-white p-4 text-[15px] leading-7 outline-none transition focus:border-edubot-orange focus:ring-2 focus:ring-edubot-orange/20 ${
                        disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-text'
                    }`}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    onInput={emitChange}
                    onBlur={emitChange}
                    onKeyUp={refreshActiveFormats}
                    onMouseUp={refreshActiveFormats}
                    onPaste={handlePaste}
                    role="textbox"
                    aria-multiline="true"
                />
            </div>
        </div>
    );
};

export default ArticleEditor;
