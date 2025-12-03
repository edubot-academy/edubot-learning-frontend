import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink } from 'react-icons/fa';

const TOOLBAR_BUTTONS = [
    { label: 'H1', command: 'formatBlock', value: 'H1' },
    { label: 'H2', command: 'formatBlock', value: 'H2' },
    { label: 'Абзац', command: 'formatBlock', value: 'P' },
    { icon: <FaBold />, command: 'bold' },
    { icon: <FaItalic />, command: 'italic' },
    { icon: <FaUnderline />, command: 'underline' },
    { icon: <FaListUl />, command: 'insertUnorderedList' },
    { icon: <FaListOl />, command: 'insertOrderedList' },
    { icon: <FaLink />, command: 'createLink' },
];

const DEFAULT_FORMATS = {
    block: 'P',
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
};

const ArticleEditor = ({
    value = '',
    onChange,
    placeholder = 'Текстти бул жерге жазыңыз...',
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
        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
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
        onChange(editorRef.current.innerHTML);
    };

    const refreshActiveFormats = useCallback(() => {
        if (typeof document === 'undefined' || !editorRef.current) return;

        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0 || !isNodeInsideEditor(selection.anchorNode)) {
            setActiveFormats({ ...DEFAULT_FORMATS });
            return;
        }

        const blockValue = document
            .queryCommandValue('formatBlock')
            ?.replace(/[<>]/g, '')
            .toUpperCase();

        setActiveFormats({
            block: blockValue || 'P',
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            unorderedList: document.queryCommandState('insertUnorderedList'),
            orderedList: document.queryCommandState('insertOrderedList'),
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
        if (disabled) return;

        if (typeof document === 'undefined') return;

        if (command === 'createLink') {
            if (typeof window === 'undefined') return;
            const selection = window.getSelection();
            if (!selection) return;

            if (selection.isCollapsed) {
                const linkText = window.prompt('Ссылка тексти:');
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

            const url = window.prompt('Ссылка кошуу (https:// менен):');
            if (!url) return;
            document.execCommand('createLink', false, url);
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
            case 'formatBlock':
                return (button.value || 'P').toUpperCase() === activeFormats.block;
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
            default:
                return false;
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {TOOLBAR_BUTTONS.map(({ label, icon, command, value: commandValue }) => (
                    <button
                        type="button"
                        key={`${command}-${label || commandValue || ''}`}
                        onClick={() => handleCommand(command, commandValue)}
                        className={`px-3 py-1 text-sm border rounded flex items-center gap-1 transition ${
                            isButtonActive({ command, value: commandValue })
                                ? 'bg-edubot-orange text-white border-edubot-orange'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        disabled={disabled}
                    >
                        {icon || label}
                    </button>
                ))}
            </div>

            <div className="relative">
                {showPlaceholder && (
                    <span className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
                        {placeholder}
                    </span>
                )}

                <div
                    ref={editorRef}
                    className={`border rounded min-h-[220px] p-3 bg-white focus-within:ring-2 focus-within:ring-edubot-orange ${
                        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text'
                    }`}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    onInput={emitChange}
                    onBlur={emitChange}
                    onKeyUp={refreshActiveFormats}
                    onMouseUp={refreshActiveFormats}
                    onPaste={handlePaste}
                />
            </div>
        </div>
    );
};

export default ArticleEditor;
