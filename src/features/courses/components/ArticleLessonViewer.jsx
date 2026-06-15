import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [sanitizedContent, setSanitizedContent] = useState('');

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

    return (
        <div className="mb-6 rounded-lg shadow-md p-6 min-h-[320px] w-full max-w-full
                       bg-white dark:bg-[#1A1A1A]
                       border border-gray-200 dark:border-[#2A2E35]">
            {lesson.locked ? (
                <div 
                    className="text-center text-gray-600 dark:text-gray-400 py-12"
                    role="status"
                    aria-label={t('public.courseShared.article.lockedAria')}
                >
                    {t('public.courseShared.article.locked')}
                </div>
            ) : sanitizedContent ? (
                <div
                    className="prose dark:prose-invert max-w-none
                               overflow-y-auto max-h-[400px] md:max-h-[500px]
                               pr-4 pb-8
                               scrollbar-thin scrollbar-thumb-gray-200
                               dark:scrollbar-thumb-gray-700
                               scrollbar-track-transparent
                               dark:scrollbar-track-gray-800
                               hover:scrollbar-thumb-gray-300
                               dark:hover:scrollbar-thumb-gray-600
                               scrollbar-thumb-rounded-full
                               scrollbar-track-rounded-full"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    role="article"
                    aria-label={t('public.courseShared.article.contentAria')}
                />
            ) : (
                <p 
                    className="text-gray-500 dark:text-gray-400"
                    role="status"
                    aria-label={t('public.courseShared.article.emptyAria')}
                >
                    {t('public.courseShared.article.empty')}
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
                        aria-label={t('public.courseShared.article.downloadResourceAria', {
                            type: resourceMeta.typeLabel,
                            fileName: resourceMeta.fileName,
                        })}
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
                            aria-label={t('public.courseShared.article.resourceTypeAria', {
                                type: resourceMeta.typeLabel,
                            })}
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
