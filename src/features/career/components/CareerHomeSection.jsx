import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STEPS_KEYS = ['form', 'preview', 'jobs'];

const CareerHomeSection = () => {
    const { t } = useTranslation();

    return (
        <section className="bg-[#141619] dark:bg-[#0e0e0e] px-4 py-16 sm:px-6 lg:px-12">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-10">
                    <div className="flex flex-col gap-3 max-w-2xl">
                        <p className="text-sm font-semibold text-[#E14219] uppercase tracking-widest">
                            EduBot Career
                        </p>
                        <h2 className="font-suisse text-2xl font-semibold leading-tight text-[#E8ECF3] sm:text-3xl">
                            {t('career.public.hero.title')}
                        </h2>
                        <p className="text-sm leading-6 text-[#a6adba] sm:text-base">
                            {t('career.public.hero.subtitle')}
                        </p>
                    </div>
                    <Link
                        to="/resume-builder"
                        className="shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#FF8C6E] to-[#E14219] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    >
                        {t('career.public.hero.cta')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {STEPS_KEYS.map((key, index) => (
                        <div
                            key={key}
                            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5"
                        >
                            <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E14219]/20 text-sm font-bold text-[#E14219]">
                                {index + 1}
                            </span>
                            <p className="font-semibold text-[#E8ECF3]">
                                {t(`career.public.steps.${key}`)}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#a6adba]">
                                {t(`career.public.steps.${key}Description`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CareerHomeSection;
