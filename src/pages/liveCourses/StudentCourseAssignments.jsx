import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentListAssignments, submitHomework, presignSubmissionUpload } from '@services/api';
import GlassCard from '@shared/ui/GlassCard';

const TEXT = {
    ky: {
        title: 'Тапшырмалар',
        submit: 'Жөнөтүү',
        resubmit: 'Кайра жиберүү',
        info: 'Жаңы же "needs_changes" абалында гана жиберүүгө болот.',
        empty: 'Тапшырмалар жок.',
        due: 'Дедлайн',
        released: 'Чыгарылды',
        attachments: 'Файлдар (URL)',
    },
    ru: {
        title: 'Задания',
        submit: 'Отправить',
        resubmit: 'Отправить снова',
        info: 'Можно отправить только новые или со статусом needs_changes.',
        empty: 'Нет заданий.',
        due: 'Дедлайн',
        released: 'Опубликовано',
        attachments: 'Файлы (URL)',
    },
};

const StudentCourseAssignments = () => {
    const { id } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState(null);
    const [answers, setAnswers] = useState({});
    const [uploading, setUploading] = useState({});
    const lang = 'ky';
    const copy = useMemo(() => TEXT[lang] || TEXT.ky, [lang]);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await studentListAssignments(id);
                const items = Array.isArray(res?.items) ? res.items : res || [];
                setAssignments(items);
            } catch (error) {
                console.error('Failed to load assignments', error);
                toast.error('Тапшырмалар жүктөлгөн жок');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSubmit = async (assignmentId) => {
        if (!assignmentId) return;
        const answer = answers[assignmentId] || {};
        setSubmittingId(assignmentId);
        try {
            await submitHomework(null, assignmentId, {
                text: answer.text || '',
                link: answer.link || '',
                attachments: answer.attachments?.filter(Boolean),
            });
            toast.success('Жөнөтүлдү');
        } catch (error) {
            console.error('Failed to submit', error);
            toast.error('Жөнөтүү мүмкүн болбоду');
        } finally {
            setSubmittingId(null);
        }
    };

    if (loading) {
        return (
            <div className="pt-20 max-w-5xl mx-auto px-4 space-y-3">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="pt-20 pb-10 max-w-5xl mx-auto px-4 space-y-4">
            <GlassCard className="p-5 space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">{copy.title}</h1>
                <p className="text-sm text-gray-500">{copy.info}</p>
            </GlassCard>
            {assignments.length ? (
                <div className="space-y-3">
                    {assignments.map((a) => (
                        <GlassCard
                            key={a.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                            <div className="flex-1 min-w-[220px] space-y-1">
                                <p className="text-lg font-semibold text-gray-900">{a.title}</p>
                                <p className="text-sm text-gray-600">{a.description}</p>
                                <p className="text-xs text-gray-500">
                                    {copy.released}: {a.releaseAt || '—'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {copy.due}: {a.dueAt || a.dueDate || '—'}
                                </p>
                                {Array.isArray(a.attachments) && a.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {a.attachments.map((att, idx) => (
                                            <a
                                                key={`${att}-${idx}`}
                                                href={att}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 underline"
                                            >
                                                {att}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex flex-col gap-2">
                                <textarea
                                    placeholder="Жооп / Ответ"
                                    value={answers[a.id]?.text || ''}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            [a.id]: { ...(prev[a.id] || {}), text: e.target.value },
                                        }))
                                    }
                                    className="w-full rounded border border-gray-200 p-2 text-sm"
                                    rows={2}
                                />
                                <input
                                    placeholder="Линк (мис., GitHub)"
                                    value={answers[a.id]?.link || ''}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            [a.id]: { ...(prev[a.id] || {}), link: e.target.value },
                                        }))
                                    }
                                    className="w-full rounded border border-gray-200 p-2 text-sm"
                                />
                                <textarea
                                    placeholder={`${copy.attachments}: https://...`}
                                    value={(answers[a.id]?.attachments || []).join('\n')}
                                    onChange={(e) =>
                                        setAnswers((prev) => ({
                                            ...prev,
                                            [a.id]: {
                                                ...(prev[a.id] || {}),
                                                attachments: e.target.value
                                                    .split('\n')
                                                    .map((s) => s.trim())
                                                    .filter(Boolean),
                                            },
                                        }))
                                    }
                                    className="w-full rounded border border-gray-200 p-2 text-sm"
                                    rows={2}
                                />
                                <input
                                    type="file"
                                    multiple
                                    onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (!files.length) return;
                                        setUploading((prev) => ({ ...prev, [a.id]: true }));
                                        try {
                                            const uploadedKeys = [];
                                            for (const file of files) {
                                                const presign = await presignSubmissionUpload({
                                                    assignmentId: a.id,
                                                    fileName: file.name,
                                                });
                                                if (presign?.maxFileSize && file.size > presign.maxFileSize) {
                                                    toast.error('Файл өтө чоң');
                                                    continue;
                                                }
                                                await fetch(presign.url, {
                                                    method: 'PUT',
                                                    body: file,
                                                    headers: { 'Content-Type': file.type || 'application/octet-stream' },
                                                });
                                                uploadedKeys.push(presign.key);
                                            }
                                            if (uploadedKeys.length) {
                                                setAnswers((prev) => ({
                                                    ...prev,
                                                    [a.id]: {
                                                        ...(prev[a.id] || {}),
                                                        attachments: [
                                                            ...(prev[a.id]?.attachments || []),
                                                            ...uploadedKeys,
                                                        ],
                                                    },
                                                }));
                                            }
                                        } catch (error) {
                                            console.error('Upload failed', error);
                                            toast.error('Жүктөө мүмкүн болбоду');
                                        } finally {
                                            setUploading((prev) => ({ ...prev, [a.id]: false }));
                                        }
                                    }}
                                    className="text-sm text-gray-600"
                                />
                                {uploading[a.id] && <p className="text-xs text-emerald-600">Жүктөлүүдө...</p>}
                            </div>
                            <button
                                type="button"
                                disabled={
                                    submittingId === a.id || (a.status && !['new', 'needs_changes'].includes(a.status))
                                }
                                onClick={() => handleSubmit(a.id)}
                                className="px-4 py-2 rounded bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {submittingId === a.id
                                    ? '...'
                                    : a.status === 'needs_changes'
                                      ? copy.resubmit
                                      : copy.submit}
                            </button>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <GlassCard className="p-4 text-sm text-gray-500">{copy.empty}</GlassCard>
            )}
        </div>
    );
};

export default StudentCourseAssignments;
