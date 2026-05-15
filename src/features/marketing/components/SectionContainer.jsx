import { useTranslation } from 'react-i18next';

const SectionContainer = ({
    title,
    subtitle,
    items = [],
    CardComponent,
    hideTitleAndLink = false,
    rightContent = null,
    cols = '3',
    loading = false,
    emptyText,
    emptyContent = null,
    loadingContent = null,
    headerVariant = 'default',
    sectionClassName = '',
    gridClassName = '',
}) => {
    const { t } = useTranslation();
    const colClasses =
        cols === '4'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : cols === '2'
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    const isMarketing = headerVariant === 'marketing';
    const headerClassName = isMarketing
        ? 'mb-10 flex flex-col gap-5 lg:mb-12 lg:flex-row lg:items-end lg:justify-between'
        : 'flex flex-col md:flex-row items-start md:items-center justify-between mb-12';
    const titleClassName = isMarketing
        ? 'font-suisse text-2xl font-semibold leading-tight text-[#141619] dark:text-[#E8ECF3] sm:text-3xl'
        : 'font-suisse font-bold text-4xl text-[#141619] dark:text-[#E8ECF3]';
    const subtitleClassName = isMarketing
        ? 'font-suisse max-w-2xl text-sm leading-6 text-[#3E424A] dark:text-[#a6adba] sm:text-base'
        : 'font-suisse font-normal text-[#3E424A] dark:text-[#a6adba] text-base max-w-md';
    const defaultLoadingContent = (
        <div
            className={`grid ${colClasses} gap-6 ${gridClassName}`}
            aria-label={t('common.loading')}
        >
            {Array.from({ length: Number(cols) || 3 }).map((_, index) => (
                <div
                    key={index}
                    className="min-h-[22rem] animate-pulse rounded-[24px] border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                />
            ))}
        </div>
    );

    return (
        <section className={`bg-transparent px-4 py-16 sm:px-6 lg:px-12 ${sectionClassName}`}>
            {!hideTitleAndLink && (
                <div className={headerClassName}>
                    <div
                        className={
                            isMarketing ? 'flex max-w-3xl flex-col gap-3' : 'flex flex-col gap-2'
                        }
                    >
                        {title && <h2 className={titleClassName}>{title}</h2>}
                        {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
                    </div>
                    {rightContent ? <div className="shrink-0">{rightContent}</div> : null}
                </div>
            )}

            {loading ? (
                loadingContent || defaultLoadingContent
            ) : !items?.length ? (
                emptyContent || (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {emptyText || t('common.empty')}
                    </p>
                )
            ) : (
                <div className={`grid ${colClasses} gap-6 ${gridClassName}`}>
                    {items.map((item, idx) => (
                        <CardComponent key={item.id ?? idx} {...item} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default SectionContainer;
