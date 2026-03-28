/* eslint-disable react/prop-types */
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiCheck, FiClock, FiMail, FiTrash2 } from 'react-icons/fi';

const AdminContactsTab = ({ contacts, onMarkRead, onDelete }) => {
    const unreadContacts = contacts.filter((contact) => !contact.isRead && !contact.readAt).length;
    const contactsWithMessage = contacts.filter((contact) => contact.message?.trim()).length;

    return (
        <div className="space-y-6">
            <DashboardSectionHeader
                eyebrow="Inbox"
                title="Байланыштар"
                description="Колдонуучулардын байланыш билдирүүлөрүн көрүп, иштетилгенин белгилеңиз."
            />

            <div className="grid gap-4 md:grid-cols-3">
                <DashboardMetricCard
                    label="Бардык билдирүүлөр"
                    value={contacts.length}
                    icon={FiMail}
                />
                <DashboardMetricCard
                    label="Окула элек"
                    value={unreadContacts}
                    icon={FiClock}
                    tone={unreadContacts ? 'amber' : 'default'}
                />
                <DashboardMetricCard
                    label="Толук билдирүү менен"
                    value={contactsWithMessage}
                    icon={FiCheck}
                    tone={contactsWithMessage ? 'green' : 'default'}
                />
            </div>

            <DashboardInsetPanel
                title="Кирген билдирүүлөр"
                description="Форма жана байланыш каналдары аркылуу келген суроолор."
            >
                {contacts.length ? (
                    <div className="mt-4 space-y-4">
                        {contacts.map((contact) => {
                            const isRead = Boolean(contact.isRead || contact.readAt);

                            return (
                                <article
                                    key={contact.id}
                                    className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <FiMail className="h-4 w-4 text-edubot-orange" />
                                                <p className="font-semibold text-edubot-ink dark:text-white">
                                                    {contact.subject || contact.name}
                                                </p>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        isRead
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                                    }`}
                                                >
                                                    {isRead ? 'Окулган' : 'Жаңы'}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                                {contact.email}
                                            </p>
                                            {contact.message ? (
                                                <p className="mt-3 text-sm text-edubot-muted dark:text-slate-400">
                                                    {contact.message}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {!isRead ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onMarkRead(contact.id)}
                                                    className="dashboard-button-primary"
                                                >
                                                    <FiCheck className="h-4 w-4" />
                                                    Окулган деп белгилөө
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => onDelete(contact.id)}
                                                className="dashboard-button-secondary"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                                Өчүрүү
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
                            title="Байланыштар табылган жок"
                            subtitle="Азырынча байланыш билдирүүлөрү жок."
                        />
                    </div>
                )}
            </DashboardInsetPanel>
        </div>
    );
};

export default AdminContactsTab;
