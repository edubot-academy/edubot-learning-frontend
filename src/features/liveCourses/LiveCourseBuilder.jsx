import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    createTypedCourse,
    updateTypedCourse,
    upsertAssignment,
    publishAssignment,
    submitHomework,
    listCourseSessions,
    generateCourseSessions,
    enrollUserInCourse,
} from '@services/api';
import { useCourseBuilder } from '../../hooks/useCourseBuilder';
import { useSessions } from '../../hooks/useSessions';
import { useRoster } from '../../hooks/useRoster';
import SessionList from './components/SessionList';
import StudentSearchCombobox from './components/StudentSearchCombobox';
import RosterTable from './components/RosterTable';
import HomeworkCard from './components/HomeworkCard';
import SubmissionModal from './components/SubmissionModal';

const TEXT = {
    ky: {
        infoTitle: 'Курс маалыматтары',
        scheduleTitle: 'Жүгүртмө',
        rosterTitle: 'Студенттер',
        planTitle: 'План жана тапшырмалар',
        previewTitle: 'Превью',
        next: 'Кийинки',
        back: 'Артка',
        saveDraft: 'Карап чыгууга сактоо',
        publish: 'Жарыялоо',
        courseType: 'Курс түрү',
        seatLimit: 'Орундар',
        startDate: 'Башталышы',
        endDate: 'Аяктоосу',
        hours: 'Күнүнө саат',
        startTime: 'Башталыш убактысы',
        timezone: 'Таймзона',
        location: 'Дарек',
        meetingUrl: 'Онлайн шилтеме',
        days: 'Апта күндөрү',
        estimate: 'Болжолдуу сабактар',
        totalStudents: 'Студенттер',
        aiMode: 'AI план',
        manualMode: 'Кол менен',
        generatePlan: 'Планды түзүү',
        homework: 'Үй тапшырмасы',
        dueRule: 'Дедлайн эрежеси',
        previewActions: 'Аракеттер',
        infoHint: 'Төмөнкү талааларды толтурсаңыз, график автоматтык түзүлөт.',
    },
    ru: {
        infoTitle: 'Инфо о курсе',
        scheduleTitle: 'Расписание',
        rosterTitle: 'Студенты',
        planTitle: 'План и задания',
        previewTitle: 'Предпросмотр',
        next: 'Далее',
        back: 'Назад',
        saveDraft: 'Сохранить черновик',
        publish: 'Опубликовать',
        courseType: 'Тип курса',
        seatLimit: 'Места',
        startDate: 'Дата начала',
        endDate: 'Дата окончания',
        hours: 'Часы в день',
        startTime: 'Время начала',
        timezone: 'Часовой пояс',
        location: 'Адрес',
        meetingUrl: 'Ссылка',
        days: 'Дни недели',
        estimate: 'Оценка кол-ва занятий',
        totalStudents: 'Студенты',
        aiMode: 'AI план',
        manualMode: 'Ручной ввод',
        generatePlan: 'Сгенерировать план',
        homework: 'Домашнее задание',
        dueRule: 'Срок сдачи',
        previewActions: 'Действия',
        infoHint: 'Заполните поля ниже, чтобы мы построили расписание.',
    },
};

const WEEKDAYS = [
    { key: 'mon', label: 'Дүйшөмбү' },
    { key: 'tue', label: 'Шейшемби' },
    { key: 'wed', label: 'Шаршемби' },
    { key: 'thu', label: 'Бейшемби' },
    { key: 'fri', label: 'Жума' },
    { key: 'sat', label: 'Ишемби' },
    { key: 'sun', label: 'Жекшемби' },
];

const stepConfig = (lang) => [
    { id: 1, label: (TEXT[lang] || TEXT.ky).infoTitle },
    { id: 2, label: (TEXT[lang] || TEXT.ky).scheduleTitle },
    { id: 3, label: (TEXT[lang] || TEXT.ky).rosterTitle },
    { id: 4, label: (TEXT[lang] || TEXT.ky).planTitle },
    { id: 5, label: (TEXT[lang] || TEXT.ky).previewTitle },
];

const LiveCourseBuilder = ({ courseType = 'offline', onBackToType, categories = [] }) => {
    const [step, setStep] = useState(1);
    const [courseId, setCourseId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [homeworkPlan, setHomeworkPlan] = useState([]);
    const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
    const [submissionPayload, setSubmissionPayload] = useState({ text: '', link: '', file: null });
    const {
        courseType: builderCourseType,
        setCourseType,
        courseInfo,
        handleInfoChange,
        validateInfo,
        planMode,
        setPlanMode,
        aiRequest,
        setAiRequest,
        aiPlan,
        setAiPlan,
        aiLoading,
        setAiLoading,
        lang,
    } = useCourseBuilder(courseType);
    const { sessions, generateSessions, updateSession, addSession, cancelSession, estimatedSessions } = useSessions(courseInfo);
    const { roster, addStudent, removeStudent, query, setQuery, results, loading, seatUsage } = useRoster(courseInfo.seatLimit);
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);
    const navigate = useNavigate();

    useEffect(() => {
        if (sessions.length === 0 && estimatedSessions > 0 && step === 2) {
            generateSessions();
        }
    }, [sessions.length, estimatedSessions, step, generateSessions]);

    useEffect(() => {
        setHomeworkPlan((prev) => {
            if (prev.length > 0) return prev;
            return sessions.map((session) => ({
                sessionId: session.id,
                topic: session.title,
                homework: '',
                dueRule: 'before_next',
            }));
        });
    }, [sessions]);

    const stepItems = stepConfig(lang);

    const handleSaveInfo = async () => {
        if (!validateInfo()) return;
        await generateSessions();
        setStep(2);
    };

    const handleGeneratePlan = () => {
        setAiLoading(true);
        const base = sessions.length ? sessions : [{ id: 'draft-1', title: courseInfo.title || 'Session 1' }];
        const plan = base.map((session, idx) => ({
            sessionId: session.id,
            topic: session.title || `Session ${idx + 1}`,
            outline: `${aiRequest.goal || 'Сабак'} — ${aiRequest.level || 'beginner'}`,
            homework: aiRequest.topics
                ? `${aiRequest.topics.split(',')[0] || 'Практика'} (${aiRequest.difficulty})`
                : 'Практикалык тапшырма',
            dueRule: 'before_next',
        }));
        setAiPlan(plan);
        setHomeworkPlan(plan);
        setAiLoading(false);
    };

    const normalizeSessions = (list) =>
        Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : [];

    const ensureSessionsInBackend = async (courseIdValue) => {
        if (!courseIdValue) return sessions;
        if (!courseInfo.startDate || !courseInfo.endDate || !courseInfo.daysOfWeek?.length) {
            return sessions;
        }
        try {
            await generateCourseSessions(courseIdValue, {
                startDate: courseInfo.startDate,
                endDate: courseInfo.endDate,
                daysOfWeek: normalizeDaysOfWeek(courseInfo.daysOfWeek),
                hoursPerDay: Number(courseInfo.hoursPerDay) || 1,
                timezone: courseInfo.timezone,
                defaultStartTime: courseInfo.defaultStartTime,
                dayTimes: courseInfo.dayTimes,
            });
        } catch (err) {
            console.error('Failed to generate sessions', err);
        }

        try {
            const fetched = await listCourseSessions(courseIdValue);
            const normalized = normalizeSessions(fetched);
            if (normalized.length) {
                const byDate = new Map(
                    sessions.map((s) => [s.date, s])
                );
                const adjusted = normalized.map((s, idx) => {
                    const match = byDate.get(s.date) || sessions[idx];
                    if (match) {
                        return {
                            ...s,
                            title: match.title || s.title,
                            startTime: match.startTime || s.startTime,
                            endTime: match.endTime || s.endTime,
                        };
                    }
                    return s;
                });
                setSessions(adjusted);
                return adjusted;
            }
        } catch (err) {
            console.warn('Failed to refresh sessions list', err);
        }
        return sessions;
    };

    const resolveSessionId = (planItem, idx, availableSessions) => {
        const numeric = Number(planItem.sessionId);
        if (!Number.isNaN(numeric) && numeric > 0) return numeric;
        if (availableSessions[idx]?.id) return availableSessions[idx].id;
        const match = availableSessions.find(
            (s) => s.title === planItem.topic || s.date === planItem.date
        );
        return match?.id;
    };

    const alignPlanWithSessions = (availableSessions = []) => {
        if (!availableSessions.length || !homeworkPlan.length) return homeworkPlan;
        const byTitle = new Map();
        const byDate = new Map();
        availableSessions.forEach((s) => {
            if (s.title) byTitle.set(s.title, s.id);
            if (s.date) byDate.set(s.date, s.id);
        });
        const updated = homeworkPlan.map((item, idx) => {
            const sessionId =
                resolveSessionId(item, idx, availableSessions) ||
                byTitle.get(item.topic) ||
                byDate.get(item.date);
            return {
                ...item,
                sessionId,
            };
        });
        setHomeworkPlan(updated);
        return updated;
    };

    const normalizeDaysOfWeek = (days = []) => {
        const map = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        return days
            .map((d) => (typeof d === 'number' ? d : map[d]?.valueOf()))
            .filter((n) => typeof n === 'number' && n >= 0 && n <= 6);
    };

    const handlePublish = async (status = 'draft') => {
        setSaving(true);
        try {
            const parsedCategoryId = courseInfo.categoryId ? parseInt(courseInfo.categoryId, 10) : undefined;
            const parsedPrice =
                courseInfo.price === '' || courseInfo.price === null || courseInfo.price === undefined
                    ? undefined
                    : Number(courseInfo.price);

            const payload = {
                ...courseInfo,
                courseType: builderCourseType,
                categoryId: parsedCategoryId,
                price: Number.isNaN(parsedPrice) ? undefined : parsedPrice,
                seatLimit: Number(courseInfo.seatLimit) || 1,
                daysOfWeek: normalizeDaysOfWeek(courseInfo.daysOfWeek),
                sessions,
                roster: roster.map((s) => s.id),
                homeworkPlan,
                status,
            };

            let created = courseId;
            if (!created) {
                const res = await createTypedCourse(payload);
                created = res?.id;
                setCourseId(created || null);
            } else {
                await updateTypedCourse(created, payload);
            }

            const latestSessions = await ensureSessionsInBackend(created);
            const alignedPlan = alignPlanWithSessions(latestSessions);

            if (status === 'published' && alignedPlan.length) {
                const assignmentPayloads = alignedPlan.map((item, idx) => {
                    const sessionId = resolveSessionId(item, idx, latestSessions);
                    const numericSession = Number(sessionId);
                    return {
                        sessionId: Number.isNaN(numericSession) ? undefined : numericSession,
                        title: item.topic || `Assignment ${idx + 1}`,
                        description: item.homework || '',
                        dueRule: item.dueRule,
                    };
                });

                // Create assignments as drafts; do not auto-publish on course creation
                await Promise.all(assignmentPayloads.map((payload) => upsertAssignment(created, payload)));
            }

            // Enroll selected roster students if any
            if (roster.length && created) {
                await Promise.all(
                    roster
                        .filter((s) => s.id)
                        .map((student) => enrollUserInCourse(student.id, created).catch(() => null))
                );
            }

            toast.success(status === 'published' ? 'Курс жарыяланды' : 'Сакталды');
        } catch (error) {
            console.error('Failed to save course', error);
            toast.error('Курс сакталбады');
        } finally {
            setSaving(false);
        }

        if (courseId || courseId === 0 || created) {
            const targetId = courseId || created;
            navigate(`/instructor/courses/${targetId}/manage`, { replace: true });
        }
    };

    const handleSubmitHomework = async () => {
        try {
            if (!homeworkPlan.length) {
                toast.error('Курс же тапшырма табылган жок');
                return;
            }
            // This is a demo submit; real submit should use assignment id after publish
            await submitHomework(null, homeworkPlan[0].sessionId, submissionPayload);
            toast.success('Тапшырма жиберилди (демо)');
            setSubmissionModalOpen(false);
        } catch (error) {
            console.error('Failed to submit homework', error);
            toast.error('Жиберүү мүмкүн болбоду');
        }
    };

    const renderInfoStep = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{copy.infoHint}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">{copy.courseType}</label>
                    <div className="flex gap-2">
                        {['offline', 'online_live'].map((type) => (
                            <label
                                key={type}
                                className={`flex-1 cursor-pointer rounded border p-3 text-center ${builderCourseType === type ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <input
                                    type="radio"
                                    name="courseType"
                                    value={type}
                                    checked={builderCourseType === type}
                                    onChange={(e) => {
                                        setCourseType(e.target.value);
                                        handleInfoChange('courseType', e.target.value);
                                    }}
                                    className="hidden"
                                />
                                <span className="capitalize">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Аталышы</label>
                    <input
                        value={courseInfo.title}
                        onChange={(e) => handleInfoChange('title', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">{copy.startDate}</label>
                    <input
                        type="date"
                        value={courseInfo.startDate}
                        onChange={(e) => handleInfoChange('startDate', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">{copy.endDate}</label>
                    <input
                        type="date"
                        value={courseInfo.endDate}
                        onChange={(e) => handleInfoChange('endDate', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">{copy.hours}</label>
                    <input
                        type="number"
                        min={1}
                        value={courseInfo.hoursPerDay}
                        onChange={(e) => handleInfoChange('hoursPerDay', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">{copy.startTime}</label>
                    <input
                        type="time"
                        value={courseInfo.defaultStartTime}
                        onChange={(e) => handleInfoChange('defaultStartTime', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Бардык күндөр үчүн демейки убакыт. Ар бир күнгө өзүнчө да коюңуз.
                    </p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">{copy.seatLimit}</label>
                    <input
                        type="number"
                        min={1}
                        value={courseInfo.seatLimit}
                        onChange={(e) => handleInfoChange('seatLimit', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Сүрөттөмө</label>
                    <textarea
                        value={courseInfo.description}
                        onChange={(e) => handleInfoChange('description', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-3"
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Категория</label>
                    <select
                        value={courseInfo.categoryId}
                        onChange={(e) => handleInfoChange('categoryId', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    >
                        <option value="">Тандаңыз</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Баасы (опциялык)</label>
                    <input
                        type="number"
                        value={courseInfo.price}
                        onChange={(e) => handleInfoChange('price', e.target.value)}
                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                    />
                </div>
                {builderCourseType === 'offline' && (
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">{copy.location}</label>
                        <input
                            value={courseInfo.location}
                            onChange={(e) => handleInfoChange('location', e.target.value)}
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                        />
                    </div>
                )}
                {builderCourseType === 'online_live' && (
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">{copy.meetingUrl}</label>
                        <input
                            value={courseInfo.meetingUrl}
                            onChange={(e) => handleInfoChange('meetingUrl', e.target.value)}
                            placeholder="https://zoom.us/..."
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                        />
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">{copy.days}</label>
                <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day) => {
                        const active = courseInfo.daysOfWeek.includes(day.key);
                        return (
                            <button
                                key={day.key}
                                type="button"
                                onClick={() => handleInfoChange('daysOfWeek', day.key)}
                                className={`px-3 py-2 rounded border text-sm ${
                                    active
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900'
                                        : 'border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                </div>
                {courseInfo.daysOfWeek.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                        {courseInfo.daysOfWeek.map((dayKey) => {
                            const dayLabel = WEEKDAYS.find((d) => d.key === dayKey)?.label || dayKey;
                            return (
                                <div
                                    key={dayKey}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-[#161616]"
                                >
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                        {dayLabel}
                                    </p>
                                    <input
                                        type="time"
                                        value={courseInfo.dayTimes?.[dayKey] || courseInfo.defaultStartTime}
                                        onChange={(e) =>
                                            handleInfoChange('dayTimes', { [dayKey]: e.target.value })
                                        }
                                        className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-2 text-sm"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {copy.estimate}: {estimatedSessions || 0}
                </div>
            </div>
            <div className="flex justify-between">
                <button
                    onClick={onBackToType}
                    className="px-4 py-2 rounded border border-gray-200 dark:border-gray-700"
                >
                    {copy.back}
                </button>
                <button
                    onClick={handleSaveInfo}
                    className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {copy.next}
                </button>
            </div>
        </div>
    );

    const renderPlanStep = () => (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    className={`px-4 py-2 rounded ${planMode === 'ai' ? 'bg-emerald-600 text-white' : 'border border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setPlanMode('ai')}
                >
                    {copy.aiMode}
                </button>
                <button
                    className={`px-4 py-2 rounded ${planMode === 'manual' ? 'bg-emerald-600 text-white' : 'border border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setPlanMode('manual')}
                >
                    {copy.manualMode}
                </button>
            </div>
            {planMode === 'ai' && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            value={aiRequest.goal}
                            onChange={(e) => setAiRequest((prev) => ({ ...prev, goal: e.target.value }))}
                            placeholder="Максат"
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                        />
                        <input
                            value={aiRequest.topics}
                            onChange={(e) => setAiRequest((prev) => ({ ...prev, topics: e.target.value }))}
                            placeholder="Темалар (алмаштыруу үчүн үтүр)"
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                        />
                        <select
                            value={aiRequest.level}
                            onChange={(e) => setAiRequest((prev) => ({ ...prev, level: e.target.value }))}
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                        >
                            <option value="beginner">Башталгыч</option>
                            <option value="intermediate">Орто</option>
                            <option value="advanced">Жогорку</option>
                        </select>
                        <select
                            value={aiRequest.difficulty}
                            onChange={(e) => setAiRequest((prev) => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                        >
                            <option value="easy">Жеңил</option>
                            <option value="medium">Орто</option>
                            <option value="hard">Кыйын</option>
                        </select>
                    </div>
                    <button
                        onClick={handleGeneratePlan}
                        disabled={aiLoading}
                        className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {aiLoading ? 'AI...' : copy.generatePlan}
                    </button>
                    <div className="grid grid-cols-1 gap-3">
                        {(aiPlan.length ? aiPlan : homeworkPlan).map((item) => (
                            <div key={item.sessionId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                <p className="font-semibold text-gray-900 dark:text-white">{item.topic}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.homework || 'AI сунуштаган план'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {planMode === 'manual' && (
                <div className="space-y-3">
                    {homeworkPlan.map((item, idx) => (
                        <div key={item.sessionId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-900 dark:text-white">{item.topic}</p>
                                <select
                                    value={item.dueRule}
                                    onChange={(e) =>
                                        setHomeworkPlan((prev) =>
                                            prev.map((entry) =>
                                                entry.sessionId === item.sessionId
                                                    ? { ...entry, dueRule: e.target.value }
                                                    : entry
                                            )
                                        )
                                    }
                                    className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-1 text-sm"
                                >
                                    <option value="before_next">{copy.dueRule}: next</option>
                                    <option value="custom">{copy.dueRule}: custom</option>
                                </select>
                            </div>
                            <textarea
                                value={item.homework}
                                onChange={(e) =>
                                    setHomeworkPlan((prev) =>
                                        prev.map((entry) =>
                                            entry.sessionId === item.sessionId
                                                ? { ...entry, homework: e.target.value }
                                                : entry
                                        )
                                    )
                                }
                                placeholder={copy.homework}
                                className="w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121212] p-2"
                                rows={2}
                            />
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-between">
                <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded border border-gray-200 dark:border-gray-700"
                >
                    {copy.back}
                </button>
                <button
                    onClick={() => setStep(5)}
                    className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                >
                    {copy.next}
                </button>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-sm text-gray-500">{copy.courseType}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{builderCourseType}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{courseInfo.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{copy.seatLimit}: {courseInfo.seatLimit}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <p className="font-semibold mb-2">{copy.scheduleTitle}</p>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {sessions.map((s) => (
                            <li key={s.id} className="flex items-center justify-between">
                                <span>{s.title}</span>
                                <span className="text-xs text-gray-500">
                                    {s.date} · {s.startTime}-{s.endTime}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <p className="font-semibold mb-2">{copy.totalStudents}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{roster.length} {copy.seatLimit}: {seatUsage}</p>
                </div>
                <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <p className="font-semibold mb-2">{copy.planTitle}</p>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {homeworkPlan.map((item) => (
                            <li key={item.sessionId}>
                                {item.topic}: {item.homework || '—'}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">{copy.previewActions}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={saving}
                        onClick={() => handlePublish('draft')}
                        className="px-4 py-2 rounded border border-gray-200 dark:border-gray-700"
                    >
                        {copy.saveDraft}
                    </button>
                    <button
                        disabled={saving}
                        onClick={() => handlePublish('published')}
                        className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                        {saving ? '...' : copy.publish}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStepContent = () => {
        if (step === 1) return renderInfoStep();
        if (step === 2)
            return (
                <div className="space-y-4">
                    <SessionList
                        sessions={sessions}
                        onAdd={() => addSession()}
                        onChange={updateSession}
                        onCancel={cancelSession}
                        lang={lang}
                    />
                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 rounded border border-gray-200 dark:border-gray-700"
                        >
                            {copy.back}
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            {copy.next}
                        </button>
                    </div>
                </div>
            );
        if (step === 3)
            return (
                <div className="space-y-4">
                    <StudentSearchCombobox
                        query={query}
                        setQuery={setQuery}
                        results={results}
                        loading={loading}
                        onSelect={addStudent}
                        lang={lang}
                    />
                    <RosterTable roster={roster} seatUsage={seatUsage} onRemove={removeStudent} lang={lang} />
                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(2)}
                            className="px-4 py-2 rounded border border-gray-200 dark:border-gray-700"
                        >
                            {copy.back}
                        </button>
                        <button
                            onClick={() => setStep(4)}
                            className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            {copy.next}
                        </button>
                    </div>
                </div>
            );
        if (step === 4) return renderPlanStep();
        return renderPreview();
    };

    return (
        <div className="pt-16 pb-10 max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offline / Live Builder</h2>
                <button
                    onClick={onBackToType}
                    className="text-sm text-emerald-600 underline"
                >
                    {copy.back}
                </button>
            </div>
            <div className="flex items-center gap-3 mb-6 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                {stepItems.map((item) => (
                    <div key={item.id} className={`flex items-center gap-2 ${step === item.id ? 'font-semibold text-emerald-600' : ''}`}>
                        <span className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            {item.id}
                        </span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-5 shadow-sm">
                {renderStepContent()}
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <HomeworkCard
                    homework={{
                        title: 'Жаңы тапшырма',
                        description: 'Жаңы үй тапшырмасы жарыяланганда студентке уведомление чыгат.',
                        status: 'pending',
                        tag: 'new',
                        dueDate: courseInfo.endDate,
                    }}
                    lang={lang}
                />
                <HomeworkCard
                    homework={{
                        title: 'Дедлайн жакындады',
                        description: 'Дедлайн жакындаганда эскертүү чыгат.',
                        status: 'pending',
                        tag: 'dueSoon',
                        dueDate: courseInfo.endDate,
                    }}
                    lang={lang}
                />
                <HomeworkCard
                    homework={{
                        title: 'Тапшырма берилди',
                        description: 'Студент тапшырманы жиберген соң статус жаңыртылат.',
                        status: 'submitted',
                        tag: 'approved',
                        dueDate: courseInfo.endDate,
                    }}
                    lang={lang}
                />
            </div>
            <SubmissionModal
                open={submissionModalOpen}
                onClose={() => setSubmissionModalOpen(false)}
                payload={submissionPayload}
                setPayload={setSubmissionPayload}
                onSubmit={handleSubmitHomework}
                lang={lang}
            />
        </div>
    );
};

export default LiveCourseBuilder;
