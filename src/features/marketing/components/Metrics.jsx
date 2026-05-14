function Metrics() {
    const metrics = [
        {
            num: '10k+',
            title: 'Окуучулар платформа аркылуу жаңы көндүмдөрдү өздөштүрүүдө',
        },
        {
            num: '200+',
            title: 'Практикалык сабактар жана окуу материалдары',
        },
        {
            num: '10+',
            title: 'IT жана санарип багыттар боюнча окуу темалары',
        },
    ];
    return (
        <section className="py-8" aria-labelledby="about-metrics-title">
            <div className="mb-6">
                <h2 id="about-metrics-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                    Биз ишенген көрсөткүчтөр
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                    Бул сандар платформанын масштабын гана эмес, окуучуга практикалык натыйжа берүү максатын да көрсөтөт.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics.map((x, index) => (
                <div
                    key={index}
                    className="flex min-h-36 flex-col justify-center gap-3 rounded-xl border border-[#C5C9D1] px-5 py-5 dark:border-gray-600"
                >
                    <span className="text-5xl font-semibold text-[#141619] dark:text-[#E8ECF3]">{x.num}</span>
                    <p className="text-base font-medium leading-6 text-[#3E424A] dark:text-[#a6adba]">{x.title}</p>
                </div>
            ))}
            </div>
        </section>
    );
}

export default Metrics;
