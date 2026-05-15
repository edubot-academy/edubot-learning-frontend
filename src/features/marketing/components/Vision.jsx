import workplace from '@assets/images/workplace.png';
import { useTranslation } from 'react-i18next';

function Vision() {
    const { t } = useTranslation();

    return (
        <section className="grid items-center gap-8 py-12 md:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1fr)] lg:gap-14">
            <img
                src={workplace}
                alt={t('public.about.visionImageAlt')}
                className="h-80 w-full rounded-2xl object-cover dark:brightness-90 dark:contrast-110 md:h-[28rem]"
                width="640"
                height="448"
                loading="lazy"
                decoding="async"
            />
            <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-edubot-orange">
                    {t('public.about.visionEyebrow')}
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-gray-900 dark:text-white sm:text-4xl">
                    {t('public.about.visionTitle')}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#3E424A] dark:text-[#a6adba]">
                    {t('public.about.visionBody1')}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-[#3E424A] dark:text-[#a6adba]">
                    {t('public.about.visionBody2')}
                </p>
            </div>
        </section>
    );
}

export default Vision;
