import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiUsers } from 'react-icons/fi';
import SectionContainer from '@features/marketing/components/SectionContainer';
import Button from '@shared/ui/Button';
import CardInstructor from './CardInstrictor';
import { fetchTopInstructors } from '@services/api';

const TopInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await fetchTopInstructors(3);
                setInstructors(Array.isArray(res?.items) ? res.items : []);
                setError(null);
            } catch {
                setError('Инструкторду жүктөөдө ката кетти');
                setInstructors([]);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <SectionContainer
            title="Топ окутуучулар"
            subtitle="Студенттер көп баалаган окутуучулар, рейтинг жана окуу тажрыйбасы боюнча тандалган."
            rightContent={
                !loading && (
                    <Link to="/courses">
                        <Button variant="secondary">
                            Курстарды көрүү
                        </Button>
                    </Link>
                )
            }
            items={instructors}
            CardComponent={CardInstructor}
            loading={loading}
            headerVariant="marketing"
            emptyContent={
                error ? (
                    <div className="rounded-[24px] border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100" role="status">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200">
                                <FiAlertTriangle aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Окутуучулар азыр көрсөтүлгөн жок</h3>
                                <p className="mt-2 text-sm leading-6">{error}</p>
                                <Link to="/courses" className="mt-4 inline-flex font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-200">
                                    Курстарды ачуу
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200" role="status">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 dark:bg-gray-900 dark:text-orange-300">
                                <FiUsers aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Азырынча топ окутуучулар жок</h3>
                                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    Жаңы рейтингдер жана окутуучулар кошулганда бул бөлүм жаңыланат.
                                </p>
                                <Link to="/courses" className="mt-4 inline-flex font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-300">
                                    Курстар каталогу
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }
        />
    );
};

export default TopInstructors;
