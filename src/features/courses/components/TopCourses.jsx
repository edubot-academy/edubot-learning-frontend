import React from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardCourse from './CardCourse';
import { Link } from 'react-router-dom';
import Button from '@shared/ui/Button';

const TopCourses = ({ coursesData, loading = false, error = '' }) => {
    const showButton = !loading;
    const statusContent = (() => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-[28rem] animate-pulse rounded border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100">
                    <h3 className="font-semibold">Курстар азыр көрсөтүлгөн жок</h3>
                    <p className="mt-2 text-sm">{error}</p>
                </div>
            );
        }

        if (!coursesData.length) {
            return (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                    <h3 className="font-semibold">Азырынча топ курстар жок</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Бардык жеткиликтүү видео курстарды каталогдон көрө аласыз.
                    </p>
                </div>
            );
        }

        return null;
    })();

    return (
        <SectionContainer
            title={
                <span className="text-lg md:text-4xl">
                    Топ курстар
                </span>
            }
            subtitle={
                <span className="text-sm sm:text-base md:text-lg">
                    Эң таанымал жана эффективдүү окуу программаларынын тандоосу.
                </span>
            }
            rightContent={
                showButton && (
                    <Link to="/courses">
                        <Button variant='secondary'>
                            Бардыгын көрүү
                        </Button>
                    </Link>
                )
            }
            items={coursesData}
            CardComponent={CardCourse}
            emptyContent={statusContent}
        />
    );
};

export default TopCourses;
