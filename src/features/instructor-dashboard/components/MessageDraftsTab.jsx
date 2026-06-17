import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiCopy, FiMail } from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { generateAiMessageDraft } from '@features/aiLms/api';
import { fetchCourseStudents } from '@features/courses/api';

const toArray = (v) =>
    Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : Array.isArray(v?.data) ? v.data : [];

const MessageDraftsTab = ({ courses = [] }) => {
    const { t } = useTranslation();
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [generating, setGenerating] = useState(false);
    const [draft, setDraft] = useState(null);

    const courseList = toArray(courses);

    const loadStudents = useCallback(async (courseId) => {
        if (!courseId) return;
        setLoadingStudents(true);
        setStudents([]);
        setSelectedStudentId('');
        try {
            const data = await fetchCourseStudents(courseId, { limit: 100 });
            setStudents(toArray(data));
        } finally {
            setLoadingStudents(false);
        }
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            loadStudents(selectedCourseId);
        }
    }, [selectedCourseId, loadStudents]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!selectedStudentId) {
            toast.error(t('instructorDashboard.messageDrafts.toasts.selectStudent'));
            return;
        }
        setGenerating(true);
        setDraft(null);
        try {
            const data = await generateAiMessageDraft(selectedStudentId, { purpose });
            setDraft(data);
        } catch {
            toast.error(t('instructorDashboard.messageDrafts.toasts.error'));
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyDraft = () => {
        const text = typeof draft?.content === 'string' ? draft.content : JSON.stringify(draft?.content || draft, null, 2);
        navigator.clipboard.writeText(text).then(() =>
            toast.success(t('instructorDashboard.messageDrafts.result.toasts.copied'))
        );
    };

    const draftText = draft
        ? typeof draft.content === 'string'
            ? draft.content
            : JSON.stringify(draft.content || draft, null, 2)
        : '';

    const inputCls =
        'w-full rounded-xl border border-edubot-line bg-white px-3 py-2 text-sm text-edubot-ink placeholder-edubot-muted focus:border-edubot-orange focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white';
    const labelCls = 'block text-xs font-medium text-edubot-muted dark:text-slate-400 mb-1';

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('instructorDashboard.messageDrafts.eyebrow')}
                title={t('instructorDashboard.messageDrafts.title')}
                description={t('instructorDashboard.messageDrafts.description')}
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <DashboardInsetPanel
                    title={t('instructorDashboard.messageDrafts.title')}
                    description={t('instructorDashboard.messageDrafts.description')}
                >
                    <form onSubmit={handleGenerate} className="mt-4 space-y-4">
                        <div>
                            <label className={labelCls}>
                                {t('instructorDashboard.messageDrafts.courseLabel')}
                            </label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => { setSelectedCourseId(e.target.value); setDraft(null); }}
                                className={inputCls}
                            >
                                <option value="">
                                    {t('instructorDashboard.messageDrafts.coursePlaceholder')}
                                </option>
                                {courseList.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>
                                {t('instructorDashboard.messageDrafts.studentLabel')}
                            </label>
                            {!selectedCourseId ? (
                                <p className="text-xs text-edubot-muted dark:text-slate-400">
                                    {t('instructorDashboard.messageDrafts.empty.course')}
                                </p>
                            ) : loadingStudents ? (
                                <div className="h-10 animate-pulse rounded-xl bg-edubot-surfaceAlt dark:bg-slate-800" />
                            ) : students.length === 0 ? (
                                <EmptyState
                                    title={t('instructorDashboard.messageDrafts.empty.student')}
                                    icon={<FiMail className="h-6 w-6 text-edubot-orange" />}
                                />
                            ) : (
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => { setSelectedStudentId(e.target.value); setDraft(null); }}
                                    className={inputCls}
                                >
                                    <option value="">
                                        {t('instructorDashboard.messageDrafts.studentPlaceholder')}
                                    </option>
                                    {students.map((s) => {
                                        const id = s.userId || s.id;
                                        const name = s.fullName || s.name || s.email || `#${id}`;
                                        return (
                                            <option key={id} value={id}>
                                                {name}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>
                                {t('instructorDashboard.messageDrafts.purposeLabel')}
                            </label>
                            <textarea
                                rows={4}
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder={t('instructorDashboard.messageDrafts.purposePlaceholder')}
                                className={inputCls}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={generating || !selectedStudentId}
                            className="flex items-center gap-1.5 rounded-xl bg-edubot-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-edubot-orange/90 disabled:opacity-50"
                        >
                            <FiMail className="h-4 w-4" />
                            {generating
                                ? t('instructorDashboard.messageDrafts.generating')
                                : t('instructorDashboard.messageDrafts.generate')}
                        </button>
                    </form>
                </DashboardInsetPanel>

                {draft ? (
                    <DashboardInsetPanel
                        title={t('instructorDashboard.messageDrafts.result.title')}
                    >
                        <div className="mt-4 space-y-3">
                            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-edubot-surfaceAlt/60 p-3 text-sm text-edubot-ink dark:bg-slate-900 dark:text-slate-200">
                                {draftText}
                            </pre>
                            <button
                                type="button"
                                onClick={handleCopyDraft}
                                className="flex items-center gap-1.5 rounded-xl border border-edubot-line px-4 py-2 text-xs font-semibold text-edubot-muted hover:border-edubot-orange hover:text-edubot-orange dark:border-slate-700 dark:text-slate-400"
                            >
                                <FiCopy className="h-3.5 w-3.5" />
                                {t('instructorDashboard.messageDrafts.result.copy')}
                            </button>
                        </div>
                    </DashboardInsetPanel>
                ) : (
                    <div className="hidden xl:flex xl:items-center xl:justify-center">
                        <div className="rounded-2xl border border-dashed border-edubot-line/60 p-12 text-center dark:border-slate-700">
                            <FiMail className="mx-auto h-8 w-8 text-edubot-muted dark:text-slate-500" />
                            <p className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                                {t('instructorDashboard.messageDrafts.description')}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

MessageDraftsTab.propTypes = {
    courses: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string,
        })
    ),
};

export default MessageDraftsTab;
