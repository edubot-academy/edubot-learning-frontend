import PropTypes from 'prop-types';
import { useRef, useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { getResourceMeta } from '../../../utils/lessonUtils';

const sanitizeHtml = async (html = '') => {
    if (typeof window === 'undefined' || !html) return '';
    const mod = await import('dompurify');
    const dp = mod.default || mod;
    dp.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A') {
            const existingRel = (node.getAttribute('rel') || '').trim();
            const relParts = new Set(
                existingRel
                    .split(/\s+/)
                    .filter(Boolean)
                    .concat(['noopener', 'noreferrer'])
            );
            node.setAttribute('rel', Array.from(relParts).join(' '));
        }
    });
    return dp.sanitize(html, {
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|data:image\/)/i,
    });
};

const ArticleLessonViewer = ({ lesson }) => {
    const [sanitizedContent, setSanitizedContent] = useState('');
    const contentRef = useRef(null);
    const [hasScroll, setHasScroll] = useState(false);
    
    const resourceMeta =
        !lesson.locked && lesson.resourceUrl
            ? getResourceMeta(lesson.resourceKey, lesson.resourceName)
            : null;

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (typeof window === 'undefined') return;
            if (!lesson?.content) {
                setSanitizedContent('');
                return;
            }
            const sanitized = await sanitizeHtml(lesson.content);
            if (!cancelled) {
                setSanitizedContent(sanitized);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [lesson?.content]);

    const checkOverflow = () => {
        if (contentRef.current) {
            const hasOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight;
            setHasScroll(hasOverflow);
        }
    };

    useEffect(() => {
        checkOverflow();
        if (!contentRef.current) return undefined;

        const imgs = contentRef.current.querySelectorAll('img');
        imgs.forEach((img) => img.addEventListener('load', checkOverflow));

        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(checkOverflow);
            ro.observe(contentRef.current);
        } else {
            window.addEventListener('resize', checkOverflow);
        }

        return () => {
            if (ro) ro.disconnect();
            else window.removeEventListener('resize', checkOverflow);
            imgs.forEach((img) => img.removeEventListener('load', checkOverflow));
        };
    }, [sanitizedContent]);

    // Добавляем базовые стили для темного режима при монтировании
    useEffect(() => {
        if (contentRef.current && sanitizedContent) {
            // Применяем базовые стили для контента
            const contentElement = contentRef.current;
            
            // Добавляем классы для стилизации HTML элементов
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                .article-content.dark-mode h1,
                .article-content.dark-mode h2,
                .article-content.dark-mode h3,
                .article-content.dark-mode h4,
                .article-content.dark-mode h5,
                .article-content.dark-mode h6 {
                    color: #ffffff;
                }
                .article-content.dark-mode p {
                    color: #d1d5db;
                }
                .article-content.dark-mode a {
                    color: #60a5fa;
                }
                .article-content.dark-mode a:hover {
                    color: #93c5fd;
                }
                .article-content.dark-mode code {
                    background-color: #374151;
                    color: #f3f4f6;
                }
                .article-content.dark-mode pre {
                    background-color: #374151;
                    color: #f3f4f6;
                    border-color: #4b5563;
                }
                .article-content.dark-mode blockquote {
                    border-color: #4b5563;
                    color: #9ca3af;
                }
                .article-content.dark-mode ul,
                .article-content.dark-mode ol {
                    color: #d1d5db;
                }
                .article-content.dark-mode table {
                    border-color: #4b5563;
                }
                .article-content.dark-mode th,
                .article-content.dark-mode td {
                    border-color: #4b5563;
                    color: #d1d5db;
                }
            `;
            contentElement.appendChild(styleElement);
            
            return () => {
                if (styleElement.parentNode === contentElement) {
                    contentElement.removeChild(styleElement);
                }
            };
        }
    }, [sanitizedContent]);

    return (
        <div className="mb-6 rounded-lg shadow-md p-6 min-h-[320px] w-full max-w-full
                       bg-white dark:bg-[#1A1A1A]
                       border border-gray-200 dark:border-[#2A2E35]">
            {lesson.locked ? (
                <div 
                    className="text-center text-gray-600 dark:text-gray-400 py-12"
                    role="status"
                    aria-label="Мазмун бөгөттөлгөн"
                >
                    Бул макаланы окуу үчүн курска катталыңыз.
                </div>
            ) : sanitizedContent ? (
                <div className="relative">
                    <div 
                        ref={contentRef}
                        className="article-content overflow-y-auto 
                                   max-h-[400px] md:max-h-[500px]
                                   pr-4
                                   scrollbar-thin scrollbar-thumb-gray-200 
                                   dark:scrollbar-thumb-gray-700
                                   scrollbar-track-transparent
                                   dark:scrollbar-track-gray-800
                                   hover:scrollbar-thumb-gray-300
                                   dark:hover:scrollbar-thumb-gray-600
                                   scrollbar-thumb-rounded-full
                                   scrollbar-track-rounded-full
                                   pb-8
                                   text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        role="article"
                        aria-label="Макаланын мазмуну"
                    />
                </div>
            ) : (
                <p 
                    className="text-gray-500 dark:text-gray-400"
                    role="status"
                    aria-label="Контент отсутствует"
                >
                    Макала тексти кошула элек.
                </p>
            )}

            {resourceMeta && (
                <div className="mt-6">
                    <a
                        href={lesson.resourceUrl}
                        className="inline-flex items-center gap-2 text-sm text-orange-600 
                                   dark:text-orange-400
                                   underline decoration-2 hover:decoration-4 transition-all
                                   group max-w-full
                                   hover:text-orange-700 dark:hover:text-orange-300"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        aria-label={`${resourceMeta.typeLabel} форматындагы, файл жуктоо ${resourceMeta.fileName}`}
                    >
                        <FiDownload
                            className="text-base flex-shrink-0 group-hover:scale-110 transition-transform"
                            aria-hidden="true"
                        />
                        <span className="font-medium truncate max-w-[calc(100%-120px)] 
                                       dark:text-gray-200">
                            {resourceMeta.fileName}
                        </span>
                        <span
                            className="text-xs uppercase text-gray-500 dark:text-gray-400 
                                     flex-shrink-0 ml-1"
                            aria-label={`${resourceMeta.typeLabel} форматы`}
                        >
                            {resourceMeta.typeLabel}
                        </span>
                    </a>
                </div>
            )}
        </div>
    );
};

ArticleLessonViewer.propTypes = {
    lesson: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        content: PropTypes.string,
        locked: PropTypes.bool,
        resourceUrl: PropTypes.string,
        resourceKey: PropTypes.string,
        resourceName: PropTypes.string,
    }).isRequired,
};

export default ArticleLessonViewer;