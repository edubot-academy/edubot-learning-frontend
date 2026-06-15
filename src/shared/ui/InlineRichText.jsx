import DOMPurify from 'dompurify'

// TipTap always wraps output in <p>...</p>. Require both start AND end so that
// plain-text options like "<p>", "<p> vs <div>", or "<p> tag" are not
// mistaken for TipTap HTML and swallowed by dangerouslySetInnerHTML.
const isHtml = (str) =>
    typeof str === 'string' &&
    str.trimStart().startsWith('<p>') &&
    str.trimEnd().endsWith('</p>')

// Legacy markdown parser for existing quizzes stored with **bold** / `code` tokens.
// Also auto-detects HTML tag patterns like <ul>, </a>, <img />, and renders them
// as code so quiz options referencing HTML syntax display correctly.
const TOKEN_REGEX = /(\*\*[^*]+\*\*|`[^`]+`|<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^<>]*)?\/?>)/g

const parseInlineRichText = (text = '') => {
    if (!text) return []

    return text.split(TOKEN_REGEX).filter(Boolean).map((chunk, idx) => {
        if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 4) {
            return { id: `bold-${idx}`, type: 'bold', text: chunk.slice(2, -2) }
        }
        if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 2) {
            return { id: `code-${idx}`, type: 'code', text: chunk.slice(1, -1) }
        }
        // HTML tag pattern like <ul>, </ol>, <a href="...">, <br />
        if (/^<\/?[a-zA-Z]/.test(chunk) && chunk.trimEnd().endsWith('>')) {
            return { id: `tag-${idx}`, type: 'code', text: chunk.trim() }
        }
        return { id: `text-${idx}`, type: 'text', text: chunk }
    })
}

const InlineRichText = ({ text = '', className = '' }) => {
    if (!text) return null

    // HTML path — new quizzes created with TipTap
    if (isHtml(text)) {
        const clean = typeof window !== 'undefined'
            ? DOMPurify.sanitize(text, { ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'code', 'br', 'span'] })
            : text
        return (
            <span
                className={`inline-rich-html whitespace-pre-wrap [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:dark:bg-slate-700 [&_code]:text-slate-900 [&_code]:dark:text-slate-100 [&_code]:font-mono [&_code]:text-[0.9em] ${className}`.trim()}
                dangerouslySetInnerHTML={{ __html: clean }}
            />
        )
    }

    // Legacy markdown path — existing quizzes with **bold** / `code`
    const segments = parseInlineRichText(text)
    if (!segments.length) return null

    return (
        <span className={`whitespace-pre-wrap ${className}`.trim()}>
            {segments.map((segment) => {
                if (segment.type === 'bold') {
                    return <strong key={segment.id}>{segment.text}</strong>
                }
                if (segment.type === 'code') {
                    return (
                        <code
                            key={segment.id}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-mono text-[0.95em]"
                        >
                            {segment.text}
                        </code>
                    )
                }
                return <span key={segment.id}>{segment.text}</span>
            })}
        </span>
    )
}

export default InlineRichText
