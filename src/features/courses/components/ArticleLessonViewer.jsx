import React, { useMemo } from 'react';
import { FiDownload } from 'react-icons/fi';
import { getResourceMeta } from '../../../utils/lessonUtils';

const sanitizeHtml = (html = '') => {
    if (typeof window === 'undefined' || !html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, iframe').forEach((node) => node.remove());
    return doc.body.innerHTML;
};

const ArticleLessonViewer = ({ lesson }) => {
    const content = useMemo(() => sanitizeHtml(lesson.content), [lesson.content]);
    const resourceMeta =
        !lesson.locked && lesson.resourceUrl
            ? getResourceMeta(lesson.resourceKey, lesson.resourceName)
            : null;

    return (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6 min-h-[320px] w-full max-w-full">
            {lesson.locked ? (
                <div className="text-center text-gray-600 py-12">
                    Бул макаланы окуу үчүн курска катталыңыз.
                </div>
            ) : content ? (
                <div 
                    className="article-content overflow-y-auto 
                               max-h-[40vh] md:max-h-[70vh]
                               pr-4
                               scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                               hover:scrollbar-thumb-gray-400"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            ) : (
                <p className="text-gray-500">Макала тексти кошула элек.</p>
            )}

            {resourceMeta && (
                <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-edubot-orange 
                               underline decoration-2 truncate max-w-full"
                    onClick={() => {
                        if (typeof window !== 'undefined') {
                            window.open(lesson.resourceUrl, '_blank', 'noopener');
                        }
                    }}
                >
                    <FiDownload className="text-base flex-shrink-0" />
                    <span className="font-medium truncate">
                        {resourceMeta.fileName}
                    </span>
                    <span className="text-xs uppercase text-gray-500 flex-shrink-0 ml-1">
                        {resourceMeta.typeLabel}
                    </span>
                </button>
            )}
        </div>
    );
};

export default ArticleLessonViewer;