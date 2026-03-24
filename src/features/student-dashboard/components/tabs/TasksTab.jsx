import { useState } from 'react';
import PropTypes from 'prop-types';
import { getTaskKey, resolveSessionHomeworkIds } from '../../utils/studentDashboard.helpers.js';

const TasksTab = ({ tasks, onSubmitHomework, submittingTaskId }) => {
    const [drafts, setDrafts] = useState({});

    const updateDraft = (taskKey, field, value) => {
        setDrafts((prev) => ({
            ...prev,
            [taskKey]: {
                ...(prev[taskKey] || {}),
                [field]: value,
            },
        }));
    };

    const submitTask = async (task) => {
        if (!onSubmitHomework) return;
        const key = getTaskKey(task);
        const draft = drafts[key] || { text: '', link: '' };
        const success = await onSubmitHomework(task, draft);
        if (success) {
            setDrafts((prev) => ({
                ...prev,
                [key]: { text: '', link: '' },
            }));
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Тапшырмалар</h2>
            {tasks.length ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto min-w-[600px] w-full text-sm shadow-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="text-left px-4 py-3">Тапшырма</th>
                                <th className="text-left px-4 py-3">Курс</th>
                                <th className="text-left px-4 py-3">Бүтүү мөөнөтү</th>
                                <th className="text-left px-4 py-3">Статус</th>
                                <th className="text-left px-4 py-3">Жооп</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => {
                                const key = getTaskKey(task);
                                const draft = drafts[key] || { text: '', link: '' };
                                const { sessionId, homeworkId } = resolveSessionHomeworkIds(task);
                                const canSubmit = Boolean(sessionId && homeworkId);
                                const isSubmitting = submittingTaskId === key;
                                const isDone =
                                    task.status === 'completed' || task.submissionStatus === 'approved';

                                return (
                                    <tr
                                        key={key}
                                        className="border-t border-gray-100 dark:border-gray-800 align-top"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-[#E8ECF3]">
                                            {task.title || task.name || 'Тапшырма'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {task.courseTitle || task.course || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                            {task.due ||
                                                task.deadline ||
                                                (task.dueAt
                                                    ? new Date(task.dueAt).toLocaleDateString('ru-RU')
                                                    : '—')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs ${isDone
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                                    }`}
                                            >
                                                {isDone ? 'Жабылган' : 'Күтүүдө'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 min-w-[280px]">
                                            {canSubmit ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={draft.text || ''}
                                                        onChange={(e) =>
                                                            updateDraft(key, 'text', e.target.value)
                                                        }
                                                        rows={2}
                                                        placeholder="Жооп жазыңыз"
                                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                                    />
                                                    <input
                                                        value={draft.link || ''}
                                                        onChange={(e) =>
                                                            updateDraft(key, 'link', e.target.value)
                                                        }
                                                        placeholder="Шилтеме (эгер бар болсо)"
                                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-[#0E0E0E]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => submitTask(task)}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-60"
                                                    >
                                                        {isSubmitting ? 'Жөнөтүлүүдө...' : 'Жөнөтүү'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    Бул тапшырма жөнөтүү API&apos;ине туташкан эмес.
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#222222] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 text-center text-gray-500 dark:text-gray-400">
                    Азырынча тапшырмалар табылган жок.
                </div>
            )}
        </div>
    );
};

TasksTab.propTypes = {
    tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSubmitHomework: PropTypes.func,
    submittingTaskId: PropTypes.string,
};

TasksTab.defaultProps = {
    onSubmitHomework: undefined,
    submittingTaskId: '',
};

export default TasksTab;
