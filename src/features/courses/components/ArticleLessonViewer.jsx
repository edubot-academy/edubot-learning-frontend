import React, { useMemo, useRef, useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { getResourceMeta } from '../../../utils/lessonUtils';

// Импортируем DOMPurify, если используется
// import DOMPurify from 'dompurify';

const sanitizeHtml = (html = '') => {
    if (typeof window === 'undefined' || !html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    

    const dangerousTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
    dangerousTags.forEach(tag => {
        doc.querySelectorAll(tag).forEach(node => node.remove());
    });
    

    doc.querySelectorAll('*').forEach(node => {
        const attributes = node.attributes;
        for (let i = attributes.length - 1; i >= 0; i--) {
            const attr = attributes[i];
            if (attr.name.startsWith('on') || // onclick, onload и т.д.
                attr.name.startsWith('javascript:') ||
                attr.name.startsWith('data:')) {
                node.removeAttribute(attr.name);
            }
        }
    });
    
    return doc.body.innerHTML;
};

const ArticleLessonViewer = ({ lesson }) => {
    const content = useMemo(() => sanitizeHtml(lesson.content), [lesson.content]);
    const contentRef = useRef(null);
    const [hasScroll, setHasScroll] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    
    const resourceMeta =
        !lesson.locked && lesson.resourceUrl
            ? getResourceMeta(lesson.resourceKey, lesson.resourceName)
            : null;

  
    useEffect(() => {
        if (contentRef.current) {
            const hasOverflow = contentRef.current.scrollHeight > contentRef.current.clientHeight;
            setHasScroll(hasOverflow);
        }
    }, [content]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
        }
    }, []);

    const handleResourceClick = (e) => {
        e.preventDefault();
        if (lesson.resourceUrl) {
            const newWindow = window.open(lesson.resourceUrl, '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        }
    };

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
            ) : content ? (
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
                        dangerouslySetInnerHTML={{ __html: content }}
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
                        onClick={handleResourceClick}
                        className="inline-flex items-center gap-2 text-sm text-edubot-orange 
                                   underline decoration-2 hover:decoration-4 transition-all
                                   group max-w-full"
                        target="_blank"
                        rel="noopener noreferrer"
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

export default ArticleLessonViewer;