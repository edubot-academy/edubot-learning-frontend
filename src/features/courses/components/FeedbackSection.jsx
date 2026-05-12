import { useEffect, useState } from 'react';
import FeedbackSlider from './FeedbackSlider';
import { getTopRatings } from '@services/api';

const FeedbackSection = ({ title, subtitle, rightContent = null }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getTopRate = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getTopRatings();
                setData(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load feedback', err);
                setError('Пикирлерди жүктөй алган жокпуз.');
            } finally {
                setLoading(false);
            }
        };

        getTopRate();
    }, []);

    return (
        <div className="px-4 py-16 sm:px-6 lg:px-12 bg-transparent relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
                <div className="flex flex-col gap-2">
                    <h2 className="font-suisse font-bold text-2xl w-64 md:w-auto md:text-4xl text-[#141619] dark:text-[#E8ECF3]">
                        {title}
                    </h2>
                    <p className="font-suisse font-normal text-[#3E424A] dark:text-[#a6adba] text-base max-w-md">
                        {subtitle}
                    </p>
                </div>
                {rightContent}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Пикирлер жүктөлүүдө">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-52 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800" />
                    ))}
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-6 text-orange-900 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-100">
                    <h3 className="font-semibold">Пикирлер азыр көрсөтүлгөн жок</h3>
                    <p className="mt-2 text-sm">{error}</p>
                </div>
            ) : data.length ? (
                <FeedbackSlider data={data} />
            ) : (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-6 text-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                    <h3 className="font-semibold">Азырынча пикирлер жок</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Студенттердин жаңы пикирлери кошулганда бул бөлүм жаңыланат.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FeedbackSection;
