import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';
import { FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const TopCourses = ({ coursesData, loading = false, error = '' }) => {
    const { t } = useTranslation();
    const showButton = !loading;
    const courseCount = coursesData.length;
    const statusContent = (() => {
        if (error) {
            return (
                <div
                    className="rounded-[24px] border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100"
                    role="status"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                            <FiAlertTriangle aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                {t('public.home.topCoursesUnavailableTitle')}
                            </h3>
                            <p className="mt-2 text-sm leading-6">{error}</p>
                            <Link
                                to="/courses"
                                className="mt-4 inline-flex font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-200"
                            >
                                {t('public.home.openCatalog')}
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        if (!coursesData.length) {
            return (
                <div
                    className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                    role="status"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 dark:bg-gray-900 dark:text-orange-300">
                            <FiBookOpen aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                {t('public.home.topCoursesEmptyTitle')}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                {t('public.home.topCoursesEmptySubtitle')}
                            </p>
                            <Link
                                to="/courses"
                                className="mt-4 inline-flex font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-300"
                            >
                                {t('public.home.coursesCatalog')}
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    })();

    return (
        <SectionContainer
            title={t('public.home.topCoursesTitle')}
            subtitle={
                courseCount
                    ? t('public.home.topCoursesSubtitleWithCount', { count: courseCount })
                    : t('public.home.topCoursesSubtitleEmpty')
            }
            rightContent={
                showButton && (
                    <Link to="/courses">
                        <Button variant="secondary">{t('public.home.viewAll')}</Button>
                    </Link>
                )
            }
            items={coursesData}
            CardComponent={CardCourse}
            emptyContent={statusContent}
            headerVariant="marketing"
            loading={loading}
        />
    );
};

export default TopCourses;
