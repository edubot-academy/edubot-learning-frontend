import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';
import { FiAlertTriangle, FiBookOpen } from 'react-icons/fi';

const TopCourses = ({ coursesData, loading = false, error = '' }) => {
    const showButton = !loading;
    const courseCount = coursesData.length;
    const statusContent = (() => {
        if (error) {
            return (
                <div className="rounded-[24px] border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100" role="status">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                            <FiAlertTriangle aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Курстар азыр көрсөтүлгөн жок</h3>
                            <p className="mt-2 text-sm leading-6">{error}</p>
                            <Link to="/courses" className="mt-4 inline-flex font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-200">
                                Каталогду ачуу
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        if (!coursesData.length) {
            return (
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200" role="status">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 dark:bg-gray-900 dark:text-orange-300">
                            <FiBookOpen aria-hidden="true" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Азырынча топ курстар жок</h3>
                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                Бардык жеткиликтүү видео курстарды каталогдон көрө аласыз.
                            </p>
                            <Link to="/courses" className="mt-4 inline-flex font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-300">
                                Курстар каталогу
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
            title={
                'Топ курстар'
            }
            subtitle={
                courseCount
                    ? `Студенттер көп тандаган ${courseCount} видео курс. Толук каталогдон өзүңүзгө туура багытты таба аласыз.`
                    : 'Эң көп тандалган видео курстар бул жерде көрсөтүлөт. Толук каталог дайыма жеткиликтүү.'
            }
            rightContent={
                showButton && (
                    <Link to="/courses">
                        <Button variant="secondary">
                            Бардыгын көрүү
                        </Button>
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
