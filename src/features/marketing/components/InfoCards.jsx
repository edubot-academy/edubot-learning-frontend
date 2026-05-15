import notebook from '@assets/icons/notebook.svg';
import security from '@assets/icons/security.svg';
import medal from '@assets/icons/medal.svg';
import { useTranslation } from 'react-i18next';

function InfoCards() {
    const { t } = useTranslation();
    const infoCards = [
        {
            icon: notebook,
            name: t('public.about.principles.0.title'),
            title: t('public.about.principles.0.body'),
        },
        {
            icon: security,
            name: t('public.about.principles.1.title'),
            title: t('public.about.principles.1.body'),
        },
        {
            icon: medal,
            name: t('public.about.principles.2.title'),
            title: t('public.about.principles.2.body'),
        },
    ];
    return (
        <section className="py-12" aria-labelledby="about-principles-title">
            <div className="mb-6">
                <h2
                    id="about-principles-title"
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                    {t('public.about.principlesTitle')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-[#a6adba]">
                    {t('public.about.principlesBody')}
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {infoCards.map((x) => (
                    <article
                        key={x.name}
                        className="flex min-h-64 flex-col items-start gap-4 rounded-xl border border-[#C5C9D1] bg-white p-5 dark:border-gray-600 dark:bg-gray-800"
                    >
                        <img
                            src={x.icon}
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 dark:brightness-90 dark:contrast-110"
                        />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {x.name}
                        </h3>
                        <p className="text-sm leading-6 text-[#3E424A] dark:text-[#a6adba]">
                            {x.title}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default InfoCards;
