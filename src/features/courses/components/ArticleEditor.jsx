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
        { icon: <FaCode />, command: 'inlineCode', title: 'Inline code' },
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
    const [history, setHistory] = useState([value || '']);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isUndoing, setIsUndoing] = useState(false);

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

        // Add to history if not undoing
        if (!isUndoing) {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(sanitized);

            // Limit history to 50 items
            if (newHistory.length > 50) {
                newHistory.shift();
            } else {
                setHistoryIndex(newHistory.length - 1);
            }
            setHistory(newHistory);
        }

        onChange(sanitized);
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleUndo = () => {
        if (!canUndo || !editorRef.current) return;
        setIsUndoing(true);
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        editorRef.current.innerHTML = history[newIndex];
        setIsUndoing(false);
        refreshActiveFormats();
    };

    const handleRedo = () => {
        if (!canRedo || !editorRef.current) return;
        setIsUndoing(true);
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        editorRef.current.innerHTML = history[newIndex];
        setIsUndoing(false);
        refreshActiveFormats();
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

        // Check if cursor is inside a code tag
        const isInsideCode = anchorNode?.tagName === 'CODE' || anchorNode?.closest?.('code');

        setActiveFormats({
            block: blockValue,
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
            quote: blockValue === 'BLOCKQUOTE',
            code: blockValue === 'PRE' || isInsideCode,
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
    }, [isNodeInsideEditor]);

    const handleCommand = (command, commandValue) => {
        if (disabled || typeof document === 'undefined') return;

        if (command === 'undo') {
            handleUndo();
            return;
        }

        if (command === 'redo') {
            handleRedo();
            return;
        }

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
        } else if (command === 'inlineCode') {
            // Handle inline code formatting (toggle) - like normal text editors
            const selection = window.getSelection();
            if (!selection) return;

            const anchorNode = selection.isCollapsed
                ? selection.anchorNode.parentElement
                : selection.anchorNode;

            // Check if we're inside a code tag
            const isInsideCode = anchorNode?.tagName === 'CODE' || anchorNode?.closest?.('code');

            if (isInsideCode) {
                // Remove code formatting
                const codeElement = anchorNode?.tagName === 'CODE' ? anchorNode : anchorNode?.closest?.('code');
                if (codeElement) {
                    const textContent = codeElement.textContent;
                    const textNode = document.createTextNode(textContent);

                    try {
                        codeElement.parentNode.replaceChild(textNode, codeElement);

                        // Select the text that was in the code element
                        selection.removeAllRanges();
                        const newRange = document.createRange();
                        newRange.selectNodeContents(textNode);
                        selection.addRange(newRange);

                        emitChange();
                    } catch (error) {
                        console.error('Error removing code formatting:', error);
                    }
                }
            } else {
                // Add code formatting - normal text editor behavior
                if (selection.isCollapsed) {
                    // If no selection, insert code tags and position cursor inside
                    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                    if (!range) return;

                    const codeElement = document.createElement('code');
                    codeElement.textContent = ''; // Empty code element

                    range.insertNode(codeElement);

                    // Position cursor inside the code element
                    selection.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.selectNodeContents(codeElement);
                    newRange.collapse(false); // Collapse to end
                    selection.addRange(newRange);

                    emitChange();
                } else {
                    // If there's selection, wrap it in code tags
                    const range = selection.getRangeAt(0);
                    const selectedText = range.toString();

                    if (selectedText) {
                        const codeElement = document.createElement('code');
                        codeElement.textContent = selectedText;

                        try {
                            range.deleteContents();
                            range.insertNode(codeElement);

                            // Select the code element
                            selection.removeAllRanges();
                            const newRange = document.createRange();
                            newRange.selectNodeContents(codeElement);
                            selection.addRange(newRange);

                            emitChange();
                        } catch (error) {
                            console.error('Error wrapping text in code tags:', error);
                        }
                    }
                }
            }
        }

        editorRef.current?.focus();
        emitChange();
        refreshActiveFormats();
    };

    const handleKeyDown = (e) => {
        // Handle backtick wrapping for inline code
        if (e.key === '`') {
            e.preventDefault();
            const selection = window.getSelection();
            if (!selection || !editorRef.current) return;

            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            if (!range) return;

            if (selection.isCollapsed) {
                // Insert backticks and position cursor in middle
                const backticks = document.createTextNode('``');
                range.insertNode(backticks);

                // Move cursor between the backticks
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStart(backticks, 1);
                newRange.setEnd(backticks, 1);
                selection.addRange(newRange);
            } else {
                // Wrap selected text in backticks
                const selectedText = range.toString();
                const codeElement = document.createElement('code');
                codeElement.textContent = selectedText;

                try {
                    range.deleteContents();
                    range.insertNode(codeElement);

                    // Select the code element
                    selection.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.selectNodeContents(codeElement);
                    selection.addRange(newRange);
                } catch (error) {
                    console.error('Error wrapping text in code tags:', error);
                }
            }

            emitChange();
            refreshActiveFormats();
            return;
        }

        // Handle other keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        handleRedo();
                    } else {
                        handleUndo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    handleRedo();
                    break;
                case 'b':
                    e.preventDefault();
                    handleCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    handleCommand('italic');
                    break;
                default:
                    break;
            }
        }
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
                if (expected === 'PRE') {
                    return activeFormats.code;
                }
                return activeFormats.block === expected;
            }
            case 'inlineCode':
                return activeFormats.code;
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
        <div className="rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
            <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-gray-600 bg-gradient-to-r from-slate-50 to-white dark:from-gray-700 dark:to-gray-800 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                    {TOOLBAR_GROUPS.map((group, groupIdx) => (
                        <div
                            key={`group-${groupIdx}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
                        >
                            {group.map(({ label, icon, command, value: commandValue, title }) => {
                                const isDisabled = disabled ||
                                    (command === 'undo' && !canUndo) ||
                                    (command === 'redo' && !canRedo);

                                return (
                                    <button
                                        type="button"
                                        key={`${command}-${label || title || commandValue || ''}`}
                                        onClick={() => handleCommand(command, commandValue)}
                                        title={title || label}
                                        disabled={isDisabled}
                                        className={`h-8 min-w-8 px-2 text-sm rounded-md flex items-center justify-center transition ${isButtonActive({ command, value: commandValue })
                                            ? 'bg-edubot-orange text-white'
                                            : isDisabled
                                                ? 'text-slate-400 dark:text-gray-500 cursor-not-allowed'
                                                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {icon || label}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <p className="mt-2 text-[11px] text-slate-500 dark:text-gray-400">
                    Кеңеш: `Ctrl/Cmd + B` калың, `Ctrl/Cmd + I` курсив. Код үчүн `&lt;/&gt;` баскычы же `` баскычын басыңыз.
                </p>
            </div>

            <div className="relative p-3">
                {showPlaceholder && (
                    <span className="absolute top-6 left-6 text-slate-400 dark:text-gray-500 pointer-events-none select-none">
                        {placeholder}
                    </span>
                )}

                <div
                    ref={editorRef}
                    className={`article-editor-content min-h-[260px] rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-[15px] leading-7 outline-none transition focus:border-edubot-orange focus:ring-2 focus:ring-edubot-orange/20 text-gray-900 dark:text-white ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-gray-700' : 'cursor-text'
                        }`}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    onInput={emitChange}
                    onBlur={emitChange}
                    onKeyUp={refreshActiveFormats}
                    onMouseUp={refreshActiveFormats}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    role="textbox"
                    aria-multiline="true"
                />
            </div>
        </div>
    );
};

export default ArticleEditor;
