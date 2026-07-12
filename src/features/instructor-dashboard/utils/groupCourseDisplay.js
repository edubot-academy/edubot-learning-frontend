export const formatGroupDate = (value, locale = 'ky-KG') => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const GROUP_STATUS_TONE = Object.freeze({
    active: 'green',
    planned: 'amber',
    completed: 'blue',
    cancelled: 'red',
});

export const getGroupStatusBadgeClass = (status) => {
    const tone = GROUP_STATUS_TONE[status];
    if (tone === 'green') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
    if (tone === 'amber') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    if (tone === 'blue') return 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
    if (tone === 'red') return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300';
};

export const getDeliveryModeBadgeClass = (value) =>
    value === 'individual'
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200';

export const formatScheduleBlocks = (blocks = [], t) =>
    (Array.isArray(blocks) ? blocks : [])
        .filter((block) => block?.day && block?.startTime && block?.endTime)
        .map((block) => {
            const day = String(block.day).toLowerCase();
            return `${t(`instructorDashboard.groupForm.weekdays.${day}`, { defaultValue: block.day })} · ${block.startTime}–${block.endTime}`;
        });

export const mapGroupRosterToStudentRows = (rows = [], fallbackName = 'Student') =>
    rows.map((student) => ({
        id: student.id,
        name: student.fullName || student.email || fallbackName,
        email: student.email || '—',
        enrolledAt: student.enrolledAt,
    }));

export const mapUsersToStudentOptions = (response = {}) => {
    const rows = response?.data || response?.items || [];
    return rows.map((user) => ({
        id: user.id,
        name: user.fullName || user.email || `ID: ${user.id}`,
        email: user.email || '',
    }));
};

export const getStudentDisplayName = (student) => {
    if (!student) return '';
    return student.fullName || student.name || student.email || (student.id ? `Student #${student.id}` : '');
};

export const getGroupMetrics = (groups = []) => {
    const planned = groups.filter((group) => group.status === 'planned').length;
    const active = groups.filter((group) => group.status === 'active').length;
    const totalSeats = groups.reduce((sum, group) => sum + Number(group.seatLimit || 0), 0);
    return {
        total: groups.length,
        planned,
        active,
        seats: totalSeats || '—',
    };
};
