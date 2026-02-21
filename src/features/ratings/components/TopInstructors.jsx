import  { useEffect, useState } from 'react';
import SectionContainer from '@features/marketing/components/SectionContainer';
import CardInstructor from './CardInstrictor';
import { fetchTopInstructors } from '@services/api';
import Loader from '@shared/ui/Loader';

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

    if (loading) return <Loader fullScreen={false} />;
    if (error) return <div>{error}</div>;

    return (
        <SectionContainer
            title="Топ Инструктор"
            subtitle="Эң таанымал жана эффективдүү окуу программаларынын тандоосу."
            // rightContent={<Button variant="secondary">Бардыгын көрүү</Button>}
            items={instructors}
            CardComponent={CardInstructor}
        />
    );
};

export default TopInstructors;
