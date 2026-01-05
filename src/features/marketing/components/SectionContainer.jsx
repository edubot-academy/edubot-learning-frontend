const SectionContainer = ({
    title,
    subtitle,
    items = [],
    CardComponent,
    hideTitleAndLink = false,
    rightContent = null,
    cols = '3',
    loading = false,
    emptyText = 'Азырынча элементтер жок.',
}) => {
    const colClasses =
        cols === '4'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : cols === '2'
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

    return (
        <div className="px-4 py-16 sm:px-6 lg:px-12 bg-transparent">
            {!hideTitleAndLink && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
                    <div className="flex flex-col gap-2">
                        {title && (
                            <h2 className="font-suisse font-bold text-4xl text-[#141619] dark:text-[#E8ECF3]">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="font-suisse font-normal text-[#3E424A] dark:text-[#a6adba] text-base max-w-md">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div>{rightContent}</div>
                </div>
            )}

            {loading ? (
                <p className="text-sm text-gray-500">Жүктөлүүдө...</p>
            ) : !items?.length ? (
                <p className="text-sm text-gray-500">{emptyText}</p>
            ) : (
                <div className={`grid ${colClasses} gap-6`}>
                    {items.map((item, idx) => (
                        <CardComponent key={item.id ?? idx} {...item} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SectionContainer;
