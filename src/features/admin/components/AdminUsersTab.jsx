
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiCalendar, FiShield, FiTrash2, FiUser, FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ROLE_OPTIONS = ['student', 'instructor', 'assistant', 'admin', 'superadmin'];

const roleToneMap = {
    superadmin: 'red',
    admin: 'red',
    instructor: 'blue',
    assistant: 'yellow',
    student: 'green',
};

const AdminUsersTab = ({
    users,
    usersPage,
    usersTotalPages,
    usersTotal,
    search,
    roleFilter,
    dateFrom,
    dateTo,
    setSearch,
    setRoleFilter,
    setDateFrom,
    setDateTo,
    handleRoleChange,
    handleDeleteUser,
    handleUsersPageChange,
    renderUserPageButtons,
    currentUser,
}) => {
    const { t } = useTranslation();
    const instructors = users.filter((user) => user.role === 'instructor').length;
    const admins = users.filter((user) => user.role === 'admin' || user.role === 'superadmin').length;
    const canManageSuperadmin = currentUser?.role === 'superadmin';
    const pageDescription = t('adminUsers.pagination.summary', {
        page: usersPage,
        totalPages: usersTotalPages,
        total: usersTotal,
    });
    const getRoleLabel = (role) => t(`adminUsers.roles.${role}`, { defaultValue: role });

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow={t('adminUsers.eyebrow')}
                title={t('adminUsers.title')}
                description={t('adminUsers.description')}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <DashboardMetricCard
                    label={t('adminUsers.metrics.currentPage')}
                    value={users.length}
                    icon={FiUsers}
                />
                <DashboardMetricCard
                    label={t('adminUsers.metrics.total')}
                    value={usersTotal}
                    icon={FiUser}
                    tone={usersTotal ? 'blue' : 'default'}
                />
                <DashboardMetricCard
                    label={t('adminUsers.metrics.instructors')}
                    value={instructors}
                    icon={FiShield}
                    tone={instructors ? 'amber' : 'default'}
                />
                <DashboardMetricCard
                    label={t('adminUsers.metrics.admins')}
                    value={admins}
                    icon={FiCalendar}
                    tone={admins ? 'red' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title={t('adminUsers.filters.title')}
                description={t('adminUsers.filters.description')}
            >
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <input
                        type="text"
                        placeholder={t('adminUsers.filters.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="dashboard-field"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="dashboard-select"
                    >
                        <option value="">{t('adminUsers.filters.allRoles')}</option>
                        {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                                {getRoleLabel(role)}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="dashboard-field"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="dashboard-field"
                    />
                </div>
            </DashboardInsetPanel>

            <DashboardInsetPanel
                title={t('adminUsers.list.title')}
                description={pageDescription}
            >
                {users.length ? (
                    <div className="mt-4 space-y-3">
                        {users.map((user) => {
                            const tone = roleToneMap[user.role] || 'default';

                            return (
                                <article
                                    key={user.id}
                                    className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60"
                                >
                                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-edubot-ink dark:text-white">
                                                    {user.fullName || t('adminUsers.fallbacks.noName')}
                                                </p>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        tone === 'green'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                            : tone === 'blue'
                                                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                                                                : tone === 'yellow'
                                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                                    : tone === 'red'
                                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                                                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                {user.email}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user, e.target.value)}
                                                className="dashboard-select min-w-[180px]"
                                                disabled={user.role === 'superadmin' && !canManageSuperadmin}
                                                aria-label={t('adminUsers.actions.changeRoleAria', {
                                                    user: user.fullName || user.email || t('common.userFallback'),
                                                })}
                                            >
                                                {ROLE_OPTIONS.filter((role) => role !== 'superadmin').map((role) => (
                                                    <option key={role} value={role}>
                                                        {getRoleLabel(role)}
                                                    </option>
                                                ))}
                                                {(canManageSuperadmin || user.role === 'superadmin') && (
                                                    <option value="superadmin">{getRoleLabel('superadmin')}</option>
                                                )}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteUser(user)}
                                                className="dashboard-button-secondary"
                                                disabled={currentUser?.id === user.id}
                                                title={currentUser?.id === user.id ? t('adminUsers.actions.deleteSelfTitle') : undefined}
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                {t('adminUsers.actions.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-4">
                        <EmptyState
                            title={t('adminUsers.empty.title')}
                            subtitle={t('adminUsers.empty.subtitle')}
                        />
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-edubot-muted dark:text-slate-400">
                        {pageDescription}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleUsersPageChange(usersPage - 1)}
                            disabled={usersPage <= 1}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('adminUsers.pagination.previous')}
                        </button>
                        <div className="flex items-center gap-1">{renderUserPageButtons()}</div>
                        <button
                            type="button"
                            onClick={() => handleUsersPageChange(usersPage + 1)}
                            disabled={usersPage >= usersTotalPages}
                            className="dashboard-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('adminUsers.pagination.next')}
                        </button>
                    </div>
                </div>
            </DashboardInsetPanel>
        </div>
    );
};

export default AdminUsersTab;
