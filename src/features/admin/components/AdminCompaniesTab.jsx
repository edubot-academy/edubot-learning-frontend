/* eslint-disable react/prop-types */
import { useMemo, useRef, useState } from 'react';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    EmptyState,
} from '@components/ui/dashboard';
import { FiBriefcase, FiEdit3, FiImage, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';

const AdminCompaniesTab = ({
    companies,
    companySearch,
    setCompanySearch,
    newCompanyName,
    setNewCompanyName,
    courses,
    onCreateCompany,
    onUpdateCompany,
    onDeleteCompany,
    onUploadCompanyLogo,
    onAssignCourseToCompany,
    onClearCourseCompany,
    onUnassignCourseFromCompany,
}) => {
    const [editingCompanyId, setEditingCompanyId] = useState(null);
    const [editingCompanyName, setEditingCompanyName] = useState('');
    const fileInputRefs = useRef({});

    const metrics = useMemo(() => {
        const totalEnrollments = companies.reduce(
            (sum, company) => sum + Number(company.enrollmentCount || 0),
            0
        );
        const linkedCourses = courses.filter((course) => Boolean(course.company?.id)).length;

        return {
            companies: companies.length,
            enrollments: totalEnrollments,
            linkedCourses,
            unassignedCourses: Math.max(courses.length - linkedCourses, 0),
        };
    }, [companies, courses]);

    return (
        <div className="space-y-6">
        <DashboardSectionHeader
            eyebrow="Companies workspace"
            title="Компаниялар"
            description="Компания профилдерин түзүп, курстарды аларга байланыштырууну ушул жерден башкарыңыз."
        />

        <div className="grid gap-4 md:grid-cols-4">
            <DashboardMetricCard
                label="Компаниялар"
                value={metrics.companies}
                icon={FiBriefcase}
            />
            <DashboardMetricCard
                label="Каттоолор"
                value={metrics.enrollments}
                icon={FiPlus}
                tone={metrics.enrollments ? 'blue' : 'default'}
            />
            <DashboardMetricCard
                label="Байланышкан курстар"
                value={metrics.linkedCourses}
                icon={FiSave}
                tone={metrics.linkedCourses ? 'green' : 'default'}
            />
            <DashboardMetricCard
                label="Эркин курстар"
                value={metrics.unassignedCourses}
                icon={FiX}
                tone={metrics.unassignedCourses ? 'amber' : 'default'}
            />
        </div>

        <DashboardInsetPanel
            title="Жаңы компания"
            description="Компаниянын атын киргизип, тизмеге кошуңуз."
        >
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="dashboard-field flex-1"
                    placeholder="Жаңы компаниянын аталышы"
                />
                <button type="button" onClick={onCreateCompany} className="dashboard-button-primary self-start">
                    <FiPlus className="h-4 w-4" />
                    Компания кошуу
                </button>
            </div>
        </DashboardInsetPanel>

        <DashboardInsetPanel
            title="Компания тизмеси"
            description="Издеп, түзөтүп, логотип жүктөп жана курстарды байланыштырыңыз."
        >
            <div className="mt-4 space-y-4">
                <input
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="dashboard-field w-full"
                    placeholder="Компаниянын аталышы боюнча издөө"
                />

                {companies.length ? (
                    <div className="space-y-4">
                        {companies.map((company) => (
                            <article
                                key={company.id}
                                className="rounded-3xl border border-edubot-line/80 bg-white/90 p-5 shadow-edubot-card dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                        {editingCompanyId === company.id ? (
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <input
                                                    value={editingCompanyName}
                                                    onChange={(e) => setEditingCompanyName(e.target.value)}
                                                    className="dashboard-field flex-1"
                                                    placeholder="Компаниянын жаңы аталышы"
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const trimmed = editingCompanyName.trim();
                                                            if (!trimmed || trimmed === company.name) {
                                                                setEditingCompanyId(null);
                                                                setEditingCompanyName('');
                                                                return;
                                                            }
                                                            onUpdateCompany(company.id, trimmed);
                                                            setEditingCompanyId(null);
                                                            setEditingCompanyName('');
                                                        }}
                                                        className="dashboard-button-primary"
                                                    >
                                                        <FiSave className="h-4 w-4" />
                                                        Сактоо
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCompanyId(null);
                                                            setEditingCompanyName('');
                                                        }}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        <FiX className="h-4 w-4" />
                                                        Жокко чыгаруу
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <FiBriefcase className="h-4 w-4 text-edubot-orange" />
                                                <h3 className="text-lg font-semibold text-edubot-ink dark:text-white">
                                                    {company.name}
                                                </h3>
                                            </div>
                                        )}
                                        <p className="mt-2 text-sm text-edubot-muted dark:text-slate-400">
                                            Каттоолор: {company.enrollmentCount || 0}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCompanyId(company.id);
                                                setEditingCompanyName(company.name);
                                            }}
                                            className="dashboard-button-secondary"
                                            disabled={editingCompanyId === company.id}
                                        >
                                            <FiEdit3 className="h-4 w-4" />
                                            Өзгөртүү
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRefs.current[company.id]?.click()}
                                            className="dashboard-button-secondary"
                                        >
                                            <FiImage className="h-4 w-4" />
                                            Логотип жүктөө
                                        </button>
                                        <input
                                            ref={(node) => {
                                                fileInputRefs.current[company.id] = node;
                                            }}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    onUploadCompanyLogo(company.id, e.target.files[0]);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onDeleteCompany(company.id)}
                                            className="dashboard-button-secondary"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                            Өчүрүү
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Компаниялар табылган жок"
                        subtitle="Издөө же жаңы компания кошуу аркылуу баштаңыз."
                    />
                )}
            </div>
        </DashboardInsetPanel>

        <DashboardInsetPanel
            title="Курс байланыштыруу"
            description="Курстарды компанияларга тандап же тазалап бериңиз."
        >
            {courses.length ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {courses.slice(0, 6).map((course) => (
                        <div
                            key={course.id}
                            className="rounded-2xl border border-edubot-line/70 bg-edubot-surfaceAlt/40 p-4 dark:border-slate-700 dark:bg-slate-900/60"
                        >
                            <div className="flex flex-col gap-3">
                                <div>
                                    <p className="font-medium text-edubot-ink dark:text-white">{course.title}</p>
                                    <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                        Азыркы компания: {course.company?.name || 'Тандалган эмес'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <select
                                        value={course.company?.id || ''}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                onAssignCourseToCompany(course.id, e.target.value);
                                            } else {
                                                onClearCourseCompany(course.id);
                                            }
                                        }}
                                        className="dashboard-select min-w-[12rem] flex-1"
                                    >
                                        <option value="">Компания тандаңыз</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                    {course.company?.id ? (
                                        <button
                                            type="button"
                                            onClick={() => onUnassignCourseFromCompany(course.id, course.company.id)}
                                            className="dashboard-button-secondary"
                                        >
                                            Алып салуу
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-4">
                    <EmptyState
                        title="Курстар табылган жок"
                        subtitle="Компанияга байланыштырууга азырынча курс жок."
                    />
                </div>
            )}
        </DashboardInsetPanel>
    </div>
    );
};

export default AdminCompaniesTab;
