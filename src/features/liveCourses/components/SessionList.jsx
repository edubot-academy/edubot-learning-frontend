import React from 'react';
import SessionRowEditor from './SessionRowEditor';

const TEXT = {
    ky: {
        header: 'Сабактар тизмеси',
        add: 'Кошумча сабак кошуу',
        empty: 'Сабактар дагы түзүлө элек',
    },
    ru: {
        header: 'Список занятий',
        add: 'Добавить дополнительное занятие',
        empty: 'Занятий пока нет',
    },
};

const SessionList = ({
    sessions = [],
    onAdd,
    onChange,
    onCancel,
    onComplete,
    onRelease,
    releasingId,
    lang = 'ky',
    renderCalendar,
    viewMode = 'list',
    startIndex = 0,
    pageSize = 10,
    onPrevPage,
    onNextPage,
}) => {
    const copy = TEXT[lang] || TEXT.ky;
    const pagedSessions =
        viewMode === 'calendar'
            ? sessions.slice(startIndex, startIndex + pageSize)
            : sessions;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{copy.header}</h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                    {copy.add}
                </button>
            </div>
            {sessions.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{copy.empty}</div>
            )}
            {viewMode === 'list' ? (
                <div className="space-y-3">
                    {sessions.length === 0 && (
                        <div className="text-sm text-gray-500">
                            {lang === 'ru' ? 'Занятий пока нет' : 'Сабактар жок'}
                        </div>
                    )}
                    {sessions.map((session) => (
                        <SessionRowEditor
                            key={session.id}
                            session={session}
                            onChange={onChange}
                            onCancel={onCancel}
                            onComplete={onComplete}
                            onRelease={onRelease}
                            releaseLoading={releasingId === session.id}
                            lang={lang}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f0f0f] p-4">
                    {renderCalendar
                        ? renderCalendar(pagedSessions)
                        : (() => {
                              if (!pagedSessions.length) {
                                  return (
                                      <div className="text-sm text-gray-500">
                                          {lang === 'ru' ? 'Нет занятий' : 'Сабактар жок'}
                                      </div>
                                  );
                              }
                              const sorted = [...pagedSessions].sort(
                                  (a, b) =>
                                      new Date(a.startsAt || a.date || 0) - new Date(b.startsAt || b.date || 0)
                              );
                              const groups = sorted.reduce((acc, s) => {
                                  const dateKey =
                                      s.date || (s.startsAt ? new Date(s.startsAt).toISOString().split('T')[0] : 'Белгисиз');
                                  const dayObj = dateKey !== 'Белгисиз' ? new Date(dateKey) : null;
                                  const monday = dayObj
                                      ? new Date(dayObj.getFullYear(), dayObj.getMonth(), dayObj.getDate() - ((dayObj.getDay() + 6) % 7))
                                      : null;
                                  const label = monday
                                      ? `Week of ${monday.toLocaleDateString('ky-KG', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}`
                                      : 'unknown';
                                  if (!acc[label]) acc[label] = [];
                                  acc[label].push({ ...s, dateKey });
                                  return acc;
                              }, {});
                              return (
                                  <div className="space-y-4">
                                      {Object.entries(groups).map(([week, list]) => (
                                          <div key={week} className="space-y-2">
                                              <p className="text-xs uppercase text-gray-500">
                                                  {week}
                                              </p>
                                              <div className="space-y-2">
                                                  {list
                                                      .sort(
                                                          (a, b) =>
                                                              new Date(a.startsAt || a.date || 0) -
                                                              new Date(b.startsAt || b.date || 0)
                                                      )
                                                      .map((s) => (
                                                          <div
                                                              key={s.id}
                                                              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                                          >
                                                              <div>
                                                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                      {s.title || 'Session'}
                                                                  </p>
                                                                  <p className="text-xs text-gray-500">
                                                                      {s.dateKey} · {s.startTime} — {s.endTime}
                                                                  </p>
                                                              </div>
                                                              <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                                                                  {s.status || 'scheduled'}
                                                              </span>
                                                          </div>
                                                      ))}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              );
                          })()}
                    <div className="flex justify-between items-center mt-3">
                        <button
                            type="button"
                            onClick={onPrevPage}
                            disabled={!onPrevPage}
                            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                        >
                            {lang === 'ru' ? 'Назад' : 'Артка'}
                        </button>
                        <button
                            type="button"
                            onClick={onNextPage}
                            disabled={!onNextPage}
                            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                        >
                            {lang === 'ru' ? 'Вперед' : 'Алга'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionList;
