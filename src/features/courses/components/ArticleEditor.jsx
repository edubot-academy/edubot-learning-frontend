import { useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import DOMPurify from 'dompurify'
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
    FaTerminal,
    FaTable,
    FaPlus,
    FaMinus,
    FaTrash,
} from 'react-icons/fa'
import '../../../styles/tiptap-editor.css'

const sanitizeHtml = (html = '') =>
    DOMPurify.sanitize(html, {
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/)/i,
        ADD_ATTR: ['data-type', 'data-question', 'data-options'],
    })

const ArticleEditor = ({ value = '', onChange, placeholder, disabled = false }) => {
    const { t } = useTranslation()
    const lastValueRef = useRef(value)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
                link: false,
                underline: false,
            }),
            Underline,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
            Placeholder.configure({
                placeholder:
                    placeholder ||
                    t('instructorDashboard.courseBuilder.articleEditor.placeholder'),
            }),
        ],
        content: sanitizeHtml(value),
        editable: !disabled,
        onUpdate: ({ editor: ed }) => {
            const html = sanitizeHtml(ed.getHTML())
            lastValueRef.current = html
            onChange?.(html)
        },
    })

    // Sync external value changes (e.g. loading a saved lesson)
    useEffect(() => {
        if (!editor || editor.isDestroyed) return
        const sanitized = sanitizeHtml(value || '')
        if (sanitized !== lastValueRef.current) {
            lastValueRef.current = sanitized
            editor.commands.setContent(sanitized, false)
        }
    }, [editor, value])

    // Sync disabled state
    useEffect(() => {
        if (!editor || editor.isDestroyed) return
        editor.setEditable(!disabled)
    }, [editor, disabled])

    const handleLink = useCallback(() => {
        if (!editor) return
        const rawUrl = window.prompt(
            t('instructorDashboard.courseBuilder.articleEditor.linkUrlPrompt')
        )
        if (!rawUrl?.trim()) return
        const url = /^(?:https?|mailto|tel):/i.test(rawUrl.trim())
            ? rawUrl.trim()
            : `https://${rawUrl.trim()}`

        if (editor.state.selection.empty) {
            const linkText = window.prompt(
                t('instructorDashboard.courseBuilder.articleEditor.linkTextPrompt')
            )
            if (!linkText) return
            editor
                .chain()
                .focus()
                .insertContent({
                    type: 'text',
                    text: linkText,
                    marks: [{ type: 'link', attrs: { href: url, target: '_blank', rel: 'noopener noreferrer' } }],
                })
                .run()
        } else {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }, [editor, t])

    if (!editor) return null

    const btn = (active, isDisabled) =>
        `h-8 min-w-8 px-2 text-sm rounded-md flex items-center justify-center transition ${
            active
                ? 'bg-edubot-orange text-white'
                : isDisabled
                ? 'text-slate-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-600'
        }`

    const group =
        'inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-1'

    const canUndo = editor.can().chain().focus().undo().run()
    const canRedo = editor.can().chain().focus().redo().run()

    return (
        <div className="rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 border-b border-slate-200 dark:border-gray-600 bg-gradient-to-r from-slate-50 to-white dark:from-gray-700 dark:to-gray-800 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Headings + Paragraph */}
                    <div className={group}>
                        {[1, 2, 3, 4].map((level) => (
                            <button
                                key={level}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    editor.chain().focus().toggleHeading({ level }).run()
                                }
                                className={btn(
                                    editor.isActive('heading', { level }),
                                    disabled
                                )}
                            >
                                H{level}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().setParagraph().run()}
                            className={btn(editor.isActive('paragraph'), disabled)}
                        >
                            P
                        </button>
                    </div>

                    {/* Inline formatting */}
                    <div className={group}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={btn(editor.isActive('bold'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.bold'
                            )}
                        >
                            <FaBold />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={btn(editor.isActive('italic'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.italic'
                            )}
                        >
                            <FaItalic />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={btn(editor.isActive('underline'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.underline'
                            )}
                        >
                            <FaUnderline />
                        </button>
                    </div>

                    {/* Blocks */}
                    <div className={group}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={btn(editor.isActive('bulletList'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.bulletedList'
                            )}
                        >
                            <FaListUl />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={btn(editor.isActive('orderedList'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.numberedList'
                            )}
                        >
                            <FaListOl />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={btn(editor.isActive('blockquote'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.quote'
                            )}
                        >
                            <FaQuoteLeft />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={btn(editor.isActive('code'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.inlineCode'
                            )}
                        >
                            <FaCode />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                            className={btn(editor.isActive('codeBlock'), disabled)}
                            title="Code block"
                        >
                            <FaTerminal />
                        </button>
                    </div>

                    {/* Table */}
                    <div className={group}>
                        {!editor.isActive('table') ? (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                        .run()
                                }
                                className={btn(false, disabled)}
                                title="Insert table"
                            >
                                <FaTable />
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => editor.chain().focus().addRowAfter().run()}
                                    className={btn(false, disabled)}
                                    title="Add row"
                                >
                                    <FaPlus className="text-[10px]" />R
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                                    className={btn(false, disabled)}
                                    title="Add column"
                                >
                                    <FaPlus className="text-[10px]" />C
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => editor.chain().focus().deleteRow().run()}
                                    className={btn(false, disabled)}
                                    title="Delete row"
                                >
                                    <FaMinus className="text-[10px]" />R
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => editor.chain().focus().deleteColumn().run()}
                                    className={btn(false, disabled)}
                                    title="Delete column"
                                >
                                    <FaMinus className="text-[10px]" />C
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => editor.chain().focus().deleteTable().run()}
                                    className={btn(false, disabled)}
                                    title="Delete table"
                                >
                                    <FaTrash />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Links */}
                    <div className={group}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={handleLink}
                            className={btn(editor.isActive('link'), disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.insertLink'
                            )}
                        >
                            <FaLink />
                        </button>
                        <button
                            type="button"
                            disabled={disabled || !editor.isActive('link')}
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            className={btn(false, disabled || !editor.isActive('link'))}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.removeLink'
                            )}
                        >
                            <FaUnlink />
                        </button>
                    </div>

                    {/* History + Clear */}
                    <div className={group}>
                        <button
                            type="button"
                            disabled={disabled || !canUndo}
                            onClick={() => editor.chain().focus().undo().run()}
                            className={btn(false, disabled || !canUndo)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.undo'
                            )}
                        >
                            <FaUndo />
                        </button>
                        <button
                            type="button"
                            disabled={disabled || !canRedo}
                            onClick={() => editor.chain().focus().redo().run()}
                            className={btn(false, disabled || !canRedo)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.redo'
                            )}
                        >
                            <FaRedo />
                        </button>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                                editor.chain().focus().clearNodes().unsetAllMarks().run()
                            }
                            className={btn(false, disabled)}
                            title={t(
                                'instructorDashboard.courseBuilder.articleEditor.toolbar.clearFormat'
                            )}
                        >
                            <FaEraser />
                        </button>
                    </div>

                </div>

                <p className="mt-2 text-[11px] text-slate-500 dark:text-gray-400">
                    {t('instructorDashboard.courseBuilder.articleEditor.keyboardHint')}
                </p>
            </div>

            {/* Editor content area */}
            <div className="p-3">
                <EditorContent
                    editor={editor}
                    className={`article-editor-content rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-[15px] leading-7 text-gray-900 dark:text-white focus-within:border-edubot-orange focus-within:ring-2 focus-within:ring-edubot-orange/20 transition ${
                        disabled ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                />
            </div>
        </div>
    )
}

export default ArticleEditor
