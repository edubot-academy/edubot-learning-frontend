/* eslint-disable react/prop-types */
import React from 'react';
import toast from 'react-hot-toast';
import {
    listCompanyMembers,
    addCompanyMember,
    addCompanyOwner,
    removeCompanyMember,
    removeCompanyOwner,
    setCompanyMemberRole,
    inviteCompanyMember,
    resendCompanyInvitation,
    fetchUsers,
} from '@services/api';
import { isPlatformAdmin } from '@shared/utils/roles';
import { DashboardInsetPanel } from '@components/ui/dashboard';
import BasicModal from '@shared/ui/BasicModal';
import ConfirmationModal from '@shared/ui/ConfirmationModal';

const MANAGEABLE_ROLES = [
    { value: 'company_admin', label: 'Tenant admin' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'assistant', label: 'Assistant' },
    { value: 'student', label: 'Student' },
];

const PLATFORM_ROLES = [{ value: 'owner', label: 'Owner' }, ...MANAGEABLE_ROLES];

const ROLE_LABELS = PLATFORM_ROLES.reduce(
    (acc, role) => ({ ...acc, [role.value]: role.label }),
    {}
);

const ROLE_DESCRIPTIONS = {
    owner: 'Platform-managed tenant owner with full ownership visibility.',
    company_admin: 'Manages tenant users, courses, and workspace settings.',
    instructor: 'Runs courses, sessions, homework, certificates, and student learning work.',
    assistant: 'Supports attendance, enrollment, and day-to-day tenant operations.',
    student: 'Learns inside assigned courses and receives onboarding setup links.',
};

export default function CompanyMembers({
    companyId,
    currentUser,
    title = 'Tenant members',
    description = 'Manage tenant roles. Owner is platform-managed and only visible to platform admins.',
    allowedRoles,
}) {
    const [items, setItems] = React.useState([]);
    const [role, setRole] = React.useState('instructor');
    const canManageOwner = isPlatformAdmin(currentUser);
    const allowedRoleSet = React.useMemo(
        () => (allowedRoles?.length ? new Set(allowedRoles) : null),
        [allowedRoles]
    );
    const roleOptions = React.useMemo(() => {
        const options = canManageOwner ? PLATFORM_ROLES : MANAGEABLE_ROLES;
        return allowedRoleSet
            ? options.filter((option) => allowedRoleSet.has(option.value))
            : options;
    }, [allowedRoleSet, canManageOwner]);
    const visibleItems = React.useMemo(
        () => (allowedRoleSet ? items.filter((item) => allowedRoleSet.has(item.role)) : items),
        [allowedRoleSet, items]
    );
    const memberSearchListId = React.useId();
    const memberSearchHelpId = React.useId();

    const [q, setQ] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [searching, setSearching] = React.useState(false);
    const [activeIdx, setActiveIdx] = React.useState(-1);
    const [selected, setSelected] = React.useState(null);
    const [addingMember, setAddingMember] = React.useState(false);
    const [removingKey, setRemovingKey] = React.useState(null);
    const [pendingRemoveMember, setPendingRemoveMember] = React.useState(null);
    const [updatingRoleKey, setUpdatingRoleKey] = React.useState(null);
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [inviteSaving, setInviteSaving] = React.useState(false);
    const [resendingKey, setResendingKey] = React.useState(null);
    const [inviteResult, setInviteResult] = React.useState(null);
    const [inviteLinkOpen, setInviteLinkOpen] = React.useState(false);
    const [inviteForm, setInviteForm] = React.useState({
        fullName: '',
        email: '',
        role: roleOptions[0]?.value || 'instructor',
        sendEmail: false,
    });

    const load = React.useCallback(async () => {
        try {
            setItems(await listCompanyMembers(companyId));
        } catch {
            toast.error('Could not load tenant members.');
        }
    }, [companyId]);

    React.useEffect(() => {
        load();
    }, [load]);

    React.useEffect(() => {
        if (selected) {
            setResults([]);
            setSearching(false);
            setActiveIdx(-1);
            return;
        }
        if (!q.trim()) {
            setResults([]);
            setActiveIdx(-1);
            setSelected(null);
            return;
        }
        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetchUsers({ page: 1, limit: 8, search: q.trim() });
                const arr = Array.isArray(res) ? res : (res?.data ?? []);
                const memberIds = new Set(
                    items.filter((m) => m.role === role).map((m) => m.userId)
                );
                const cleaned = arr
                    .filter((u) => !memberIds.has(u.id))
                    .map((u) => ({
                        id: u.id,
                        fullName: u.fullName,
                        email: u.email,
                        avatarUrl: u.avatarUrl,
                    }));
                setResults(cleaned);
                setActiveIdx(cleaned.length ? 0 : -1);
            } catch {
                setResults([]);
                setActiveIdx(-1);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [q, items, selected, role]);

    const onPick = (u) => {
        setSelected(u);
        setQ(u.fullName || u.email || `#${u.id}`);
        setResults([]);
        setSearching(false);
        setActiveIdx(-1);
    };

    const resetPicker = () => {
        setSelected(null);
        setQ('');
        setRole(roleOptions[0]?.value || 'instructor');
    };

    React.useEffect(() => {
        if (!roleOptions.some((option) => option.value === role)) {
            setRole(roleOptions[0]?.value || 'instructor');
        }
    }, [role, roleOptions]);

    React.useEffect(() => {
        if (!roleOptions.some((option) => option.value === inviteForm.role)) {
            setInviteForm((prev) => ({ ...prev, role: roleOptions[0]?.value || 'instructor' }));
        }
    }, [inviteForm.role, roleOptions]);

    const onAdd = async (e) => {
        e?.preventDefault?.();
        const userId = selected?.id;
        if (!userId) return toast.error('Select a user first.');
        try {
            setAddingMember(true);
            if (role === 'owner') {
                await addCompanyOwner(companyId, userId);
            } else {
                await addCompanyMember(companyId, { userId, role });
            }
            toast.success('Member added.');
            resetPicker();
            await load();
        } catch {
            toast.error('Could not add member.');
        } finally {
            setAddingMember(false);
        }
    };

    const onRemove = (member) => {
        setPendingRemoveMember(member);
    };

    const confirmRemove = async () => {
        if (!pendingRemoveMember) return;

        const member = pendingRemoveMember;
        const key = member.id || `${member.userId}-${member.role}`;
        try {
            setRemovingKey(key);
            if (member.role === 'owner') {
                await removeCompanyOwner(companyId, member.userId);
            } else {
                await removeCompanyMember(companyId, member.userId, member.role);
            }
            toast.success('Member removed.');
            setPendingRemoveMember(null);
            await load();
        } catch {
            toast.error('Could not remove member.');
        } finally {
            setRemovingKey(null);
        }
    };

    const onSetRole = async (member, newRole) => {
        const key = member.id || `${member.userId}-${member.role}`;
        try {
            if (newRole === member.role) return;
            setUpdatingRoleKey(key);
            await setCompanyMemberRole(companyId, member.userId, newRole, 'replace', member.role);
            await load();
            toast.success('Role updated.');
        } catch {
            toast.error('Could not update role.');
        } finally {
            setUpdatingRoleKey(null);
        }
    };

    const closeInvite = () => {
        if (inviteSaving) return;
        setInviteOpen(false);
        setInviteResult(null);
        setInviteForm({
            fullName: '',
            email: '',
            role: roleOptions[0]?.value || 'instructor',
            sendEmail: false,
        });
    };

    const onInvite = async (event) => {
        event.preventDefault();
        setInviteSaving(true);
        setInviteResult(null);
        try {
            const result = await inviteCompanyMember(companyId, {
                fullName: inviteForm.fullName.trim(),
                email: inviteForm.email.trim(),
                role: inviteForm.role,
                sendEmail: inviteForm.sendEmail,
            });
            setInviteResult(result);
            toast.success(result.created ? 'User created and added.' : 'User added to tenant.');
            await load();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Invite/create failed.');
        } finally {
            setInviteSaving(false);
        }
    };

    const copySetupLink = async () => {
        const link = inviteResult?.onboarding?.setupLink;
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link);
            toast.success('Setup link copied.');
        } catch {
            toast.error('Could not copy setup link.');
        }
    };

    const onResendInvite = async (member) => {
        const rowKey = member.id || `${member.userId}-${member.role}`;
        setResendingKey(rowKey);
        try {
            const result = await resendCompanyInvitation(companyId, member.userId, {
                sendEmail: true,
            });
            setInviteResult(result);
            setInviteLinkOpen(true);
            toast.success(
                result?.onboarding?.emailSent ? 'Invite resent.' : 'Invite link regenerated.'
            );
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Could not resend invite.');
        } finally {
            setResendingKey(null);
        }
    };

    const onKeyDown = (e) => {
        if (!results.length) {
            if (e.key === 'Escape') setResults([]);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => (i + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => (i - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const u = results[activeIdx] || results[0];
            if (u) onPick(u);
        } else if (e.key === 'Escape') {
            setResults([]);
            setActiveIdx(-1);
        }
    };

    return (
        <DashboardInsetPanel title={title} description={description}>
            <div className="mt-4 space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {roleOptions.map((option) => (
                        <div
                            key={option.value}
                            className="rounded-2xl border border-edubot-line/80 bg-edubot-surfaceAlt/40 p-3 dark:border-slate-700 dark:bg-slate-900/60"
                        >
                            <div className="text-sm font-semibold text-edubot-ink dark:text-white">
                                {option.label}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                {ROLE_DESCRIPTIONS[option.value]}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p
                        id={memberSearchHelpId}
                        className="text-sm text-edubot-muted dark:text-slate-400"
                    >
                        Search an existing user and assign the role they should hold in this tenant.
                    </p>
                    <button
                        type="button"
                        className="dashboard-button-secondary"
                        onClick={() => setInviteOpen(true)}
                    >
                        Invite/create member
                    </button>
                </div>

                <form onSubmit={onAdd} className="space-y-2">
                    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_14rem_auto]">
                        <div className="relative">
                            <label htmlFor="tenant-member-search" className="sr-only">
                                Search existing users
                            </label>
                            <input
                                id="tenant-member-search"
                                className="dashboard-field w-full"
                                placeholder="Search by name or email..."
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setSelected(null);
                                }}
                                onKeyDown={onKeyDown}
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={
                                    !selected && (results.length > 0 || searching || q.trim())
                                        ? true
                                        : false
                                }
                                aria-controls={memberSearchListId}
                                aria-describedby={memberSearchHelpId}
                                aria-activedescendant={
                                    activeIdx >= 0 && results[activeIdx]
                                        ? `${memberSearchListId}-option-${results[activeIdx].id}`
                                        : undefined
                                }
                                onBlur={() =>
                                    setTimeout(() => {
                                        setResults([]);
                                        setSearching(false);
                                    }, 120)
                                }
                                autoComplete="off"
                            />
                            {!selected && (results.length > 0 || searching || q.trim()) && (
                                <div
                                    id={memberSearchListId}
                                    role="listbox"
                                    aria-label="User search results"
                                    className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-edubot-line bg-white shadow-edubot-card dark:border-slate-700 dark:bg-slate-900"
                                >
                                    {searching && (
                                        <div
                                            className="px-3 py-2 text-sm text-gray-500"
                                            role="status"
                                        >
                                            Изделүүдө...
                                        </div>
                                    )}
                                    {!searching &&
                                        results.map((u, i) => (
                                            <button
                                                type="button"
                                                key={u.id}
                                                id={`${memberSearchListId}-option-${u.id}`}
                                                role="option"
                                                aria-selected={i === activeIdx}
                                                onClick={() => onPick(u)}
                                                className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${i === activeIdx ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                                            >
                                                {u.avatarUrl ? (
                                                    <img
                                                        src={u.avatarUrl}
                                                        alt=""
                                                        className="h-6 w-6 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-gray-200" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="text-sm">
                                                        {u.fullName || `#${u.id}`}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {u.email || '-'}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400">#{u.id}</div>
                                            </button>
                                        ))}
                                    {!searching && results.length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-500">
                                            Туура келген колдонуучу жок.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <label className="sr-only" htmlFor="tenant-member-role">
                            Tenant role
                        </label>
                        <select
                            id="tenant-member-role"
                            className="dashboard-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            {roleOptions.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>

                        <button
                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!selected || addingMember}
                        >
                            {addingMember ? 'Adding...' : 'Add member'}
                        </button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-2xl border border-edubot-line/80 dark:border-slate-700">
                    <table className="min-w-[42rem] w-full text-left text-sm">
                        <thead className="bg-edubot-surfaceAlt/70 text-xs uppercase tracking-wide text-edubot-muted dark:bg-slate-900 dark:text-slate-400">
                            <tr>
                                <th className="px-4 py-3 font-semibold">User</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Role</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-edubot-line/70 bg-white dark:divide-slate-700 dark:bg-slate-950">
                            {visibleItems.map((m) => {
                                const rowKey = m.id || `${m.userId}-${m.role}`;
                                const canEditRole = m.role !== 'owner' || canManageOwner;
                                const canResendInvite = m.role === 'student';
                                const rowRoleOptions =
                                    canManageOwner || m.role !== 'owner'
                                        ? roleOptions
                                        : [{ value: 'owner', label: ROLE_LABELS.owner }];
                                return (
                                    <tr
                                        key={m.id || `${m.userId}-${m.role}`}
                                        className="transition hover:bg-edubot-surfaceAlt/40 dark:hover:bg-slate-900"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {m.avatarUrl ? (
                                                    <img
                                                        src={m.avatarUrl}
                                                        alt=""
                                                        className="h-6 w-6 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-gray-200" />
                                                )}
                                                <div>{m.fullName || `#${m.userId}`}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-edubot-muted dark:text-slate-400">
                                            {m.email || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <select
                                                    className="dashboard-select min-w-[11rem]"
                                                    value={m.role}
                                                    onChange={(e) => onSetRole(m, e.target.value)}
                                                    disabled={
                                                        !canEditRole ||
                                                        updatingRoleKey === rowKey ||
                                                        removingKey === rowKey
                                                    }
                                                >
                                                    {rowRoleOptions.map((r) => (
                                                        <option key={r.value} value={r.value}>
                                                            {r.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="text-xs text-edubot-muted dark:text-slate-400">
                                                    {ROLE_DESCRIPTIONS[m.role] ||
                                                        'Tenant workspace access.'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {canResendInvite ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onResendInvite(m)}
                                                        className="dashboard-button-secondary disabled:opacity-50"
                                                        disabled={
                                                            resendingKey === rowKey ||
                                                            removingKey === rowKey ||
                                                            updatingRoleKey === rowKey
                                                        }
                                                    >
                                                        {resendingKey === rowKey
                                                            ? 'Sending...'
                                                            : 'Resend invite'}
                                                    </button>
                                                ) : null}
                                                <button
                                                    type="button"
                                                    onClick={() => onRemove(m)}
                                                    className="dashboard-button-secondary text-red-600 disabled:opacity-50"
                                                    disabled={
                                                        (m.role === 'owner' && !canManageOwner) ||
                                                        removingKey === rowKey ||
                                                        updatingRoleKey === rowKey ||
                                                        resendingKey === rowKey
                                                    }
                                                >
                                                    {removingKey === rowKey
                                                        ? 'Removing...'
                                                        : 'Remove'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {visibleItems.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">
                                        No tenant members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <BasicModal
                isOpen={inviteOpen}
                onClose={closeInvite}
                title="Invite/create member"
                subtitle="Create a platform user if needed, then attach the tenant role."
                size="md"
            >
                <form onSubmit={onInvite} className="space-y-4">
                    <label className="block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            Full name
                        </span>
                        <input
                            className="dashboard-field w-full"
                            value={inviteForm.fullName}
                            onChange={(event) =>
                                setInviteForm((prev) => ({ ...prev, fullName: event.target.value }))
                            }
                            required
                            minLength={2}
                        />
                    </label>
                    <label className="block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            Email
                        </span>
                        <input
                            className="dashboard-field w-full"
                            type="email"
                            value={inviteForm.email}
                            onChange={(event) =>
                                setInviteForm((prev) => ({ ...prev, email: event.target.value }))
                            }
                            required
                        />
                    </label>
                    <label className="block space-y-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-edubot-muted dark:text-slate-400">
                            Tenant role
                        </span>
                        <select
                            className="dashboard-select w-full"
                            value={inviteForm.role}
                            onChange={(event) =>
                                setInviteForm((prev) => ({ ...prev, role: event.target.value }))
                            }
                        >
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-edubot-muted dark:text-slate-400">
                        <input
                            type="checkbox"
                            checked={inviteForm.sendEmail}
                            onChange={(event) =>
                                setInviteForm((prev) => ({
                                    ...prev,
                                    sendEmail: event.target.checked,
                                }))
                            }
                        />
                        Send setup email
                    </label>

                    {inviteResult?.onboarding?.setupLink && (
                        <div className="rounded-xl border border-edubot-line bg-edubot-surfaceAlt/60 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="font-semibold text-edubot-ink dark:text-white">
                                Setup link
                            </div>
                            <div className="mt-1 break-all text-edubot-muted dark:text-slate-400">
                                {inviteResult.onboarding.setupLink}
                            </div>
                            <button
                                type="button"
                                className="dashboard-button-secondary mt-3"
                                onClick={copySetupLink}
                            >
                                Copy link
                            </button>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="dashboard-button-secondary"
                            onClick={closeInvite}
                        >
                            Close
                        </button>
                        <button
                            className="dashboard-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={inviteSaving}
                        >
                            {inviteSaving ? 'Saving...' : 'Create/invite'}
                        </button>
                    </div>
                </form>
            </BasicModal>
            <BasicModal
                isOpen={inviteLinkOpen}
                onClose={() => setInviteLinkOpen(false)}
                title="Invite setup link"
                subtitle="Copy and share this link if the user did not receive the setup email."
                size="md"
            >
                {inviteResult?.onboarding?.setupLink ? (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-edubot-line bg-edubot-surfaceAlt/60 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="font-semibold text-edubot-ink dark:text-white">
                                Setup link
                            </div>
                            <div className="mt-1 break-all text-edubot-muted dark:text-slate-400">
                                {inviteResult.onboarding.setupLink}
                            </div>
                            <div className="mt-2 text-xs text-edubot-muted dark:text-slate-400">
                                {inviteResult.onboarding.emailSent ? 'Email sent. ' : ''}
                                Expires: {inviteResult.onboarding.expiresAt || 'soon'}.
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="dashboard-button-secondary"
                                onClick={() => setInviteLinkOpen(false)}
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="dashboard-button-primary"
                                onClick={copySetupLink}
                            >
                                Copy link
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                        No setup link is available for this member. The account may already be
                        active.
                    </div>
                )}
            </BasicModal>
            <ConfirmationModal
                isOpen={Boolean(pendingRemoveMember)}
                onClose={() => setPendingRemoveMember(null)}
                onConfirm={confirmRemove}
                title="Remove member"
                message={`Remove ${pendingRemoveMember?.fullName || pendingRemoveMember?.email || 'this member'} from this tenant?`}
                confirmLabel="Remove"
                cancelLabel="Cancel"
                confirmVariant="danger"
                loading={Boolean(removingKey)}
            />
        </DashboardInsetPanel>
    );
}
