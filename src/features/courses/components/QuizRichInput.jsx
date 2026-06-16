import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import DOMPurify from 'dompurify'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import '../../../styles/tiptap-editor.css'

const escHtml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Matches backtick code spans (`alt`, `href`, etc.) OR HTML tags (<img>, </ul>, …).
// Both are converted to <code> nodes so they render with code styling in TipTap.
const INLINE_CODE_RE = /(`[^`\n]+`)|(<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?\/?>)/g

// TipTap always produces content wrapped in <p>.
// Plain-text values (e.g. from the paste-import parser) must be converted:
// - backtick spans like `alt` → <code>alt</code>
// - HTML tag tokens like <img> → <code>&lt;img&gt;</code>
// - remaining chars are HTML-escaped so TipTap doesn't misparse them
const toEditorContent = (val) => {
    if (!val) return '<p></p>'
    // TipTap output always starts with <p> AND ends with </p>.
    // Plain-text options like "<p>" or "<p> vs <div>" must not be mistaken for HTML.
    if (val.trimStart().startsWith('<p>') && val.trimEnd().endsWith('</p>')) return val

    const parts = []
    let last = 0
    INLINE_CODE_RE.lastIndex = 0
    let m
    while ((m = INLINE_CODE_RE.exec(val)) !== null) {
        if (m.index > last) parts.push(escHtml(val.slice(last, m.index)))
        if (m[1]) {
            // backtick span — strip the backticks, escape the inner content
            parts.push(`<code>${escHtml(m[1].slice(1, -1))}</code>`)
        } else {
            // HTML tag — escape the angle brackets so TipTap shows them as text
            parts.push(`<code>${escHtml(m[0])}</code>`)
        }
        last = m.index + m[0].length
    }
    if (last < val.length) parts.push(escHtml(val.slice(last)))

    return `<p>${parts.join('')}</p>`
}

const EXTENSIONS_BASE = [
    StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
        strike: false,
        dropcursor: false,
        gapcursor: false,
    }),
    Underline,
]

const QuizRichInput = ({
    value = '',
    onChange,
    placeholder = '',
    className = '',
    disabled = false,
}) => {
    const lastValueRef = useRef(value)

    const editor = useEditor({
        extensions: [
            ...EXTENSIONS_BASE,
            Placeholder.configure({ placeholder }),
        ],
        content: toEditorContent(value),
        editable: !disabled,
        onUpdate: ({ editor: ed }) => {
            const html = typeof window !== 'undefined'
                ? DOMPurify.sanitize(ed.getHTML(), {
                    ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'code'],
                    ALLOWED_ATTR: [],
                })
                : ed.getHTML()
            lastValueRef.current = html
            onChange?.(html)
        },
    })

    useEffect(() => {
        if (!editor || editor.isDestroyed) return
        if (value !== lastValueRef.current) {
            lastValueRef.current = value || ''
            editor.commands.setContent(toEditorContent(value), false)
        }
    }, [editor, value])

    useEffect(() => {
        if (!editor || editor.isDestroyed) return
        editor.setEditable(!disabled)
    }, [editor, disabled])

    if (!editor) return null

    const bubbleBtn = (active) =>
        `h-7 w-7 rounded flex items-center justify-center transition-colors ${
            active
                ? 'bg-edubot-orange text-white'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`

    return (
        <div className={`quiz-rich-input ${className}`}>
            <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 100, placement: 'top' }}
                className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg p-1 z-50"
            >
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={bubbleBtn(editor.isActive('bold'))}
                    title="Bold"
                >
                    <span className="text-sm font-bold">B</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={bubbleBtn(editor.isActive('italic'))}
                    title="Italic"
                >
                    <span className="text-sm italic font-serif">I</span>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={bubbleBtn(editor.isActive('underline'))}
                    title="Underline"
                >
                    <span className="text-sm underline">U</span>
                </button>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={bubbleBtn(editor.isActive('code'))}
                    title="Inline code"
                >
                    <span className="text-xs font-mono">{`</>`}</span>
                </button>
            </BubbleMenu>

            <EditorContent editor={editor} />
        </div>
    )
}

export default QuizRichInput
