import { useEffect, useState } from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
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
                setInstructors(res.items);
            } catch (err) {
                setError('Инструкторду жүктөөдө ката кетти');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <SectionContainer
            title="Топ Инструктор"
            subtitle="Эң таанымал жана эффективдүү окуу программаларынын тандоосу."
            items={instructors}
            CardComponent={CardInstructor}
            loading={loading}
            emptyContent={
                error ? (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100">
                        <h3 className="font-semibold">Инструкторлор азыр көрсөтүлгөн жок</h3>
                        <p className="mt-2 text-sm">{error}</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                        <h3 className="font-semibold">Азырынча топ инструкторлор жок</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Жаңы инструкторлор кошулганда бул бөлүм жаңыланат.
                        </p>
                    </div>
                )
            }
        />
    );
};

export default TopInstructors;
