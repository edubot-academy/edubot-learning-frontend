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

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 min-h-[320px] w-full max-w-full">
            {lesson.locked ? (
                <div 
                    className="text-center text-gray-600 py-12"
                    role="status"
                    aria-label="Контент заблокирован"
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
                                   scrollbar-track-transparent
                                   hover:scrollbar-thumb-gray-300
                                   scrollbar-thumb-rounded-full
                                   scrollbar-track-rounded-full
                                   pb-8"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                        role="article"
                        aria-label="Содержимое статьи"
                    />
                   
                    {hasScroll && (
                        <div 
                            className="absolute bottom-0 left-0 right-4 
                                       h-8 bg-gradient-to-t from-white to-transparent 
                                       pointer-events-none flex items-end justify-center"
                            aria-hidden="true"
                        >
                        </div>
                    )}
                </div>
            ) : (
                <p 
                    className="text-gray-500"
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
                        className="inline-flex items-center gap-2 text-sm text-edubot-orange 
                                   underline decoration-2 hover:decoration-4 transition-all
                                   group max-w-full"
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        aria-label={`Скачать файл ${resourceMeta.fileName}, формат ${resourceMeta.typeLabel}`}
                    >
                        <FiDownload
                            className="text-base flex-shrink-0 group-hover:scale-110 transition-transform"
                            aria-hidden="true"
                        />
                        <span className="font-medium truncate max-w-[calc(100%-120px)]">
                            {resourceMeta.fileName}
                        </span>
                        <span
                            className="text-xs uppercase text-gray-500 flex-shrink-0 ml-1"
                            aria-label={`формат ${resourceMeta.typeLabel}`}
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
