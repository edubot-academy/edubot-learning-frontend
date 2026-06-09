import { useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@app/providers';
import ExternalResourceAuthPrompt from '../components/ExternalResourceAuthPrompt';
import ExternalResourceDisclaimer from '../components/ExternalResourceDisclaimer';
import { getResourceBySlug, LEVELS, PROVIDER_COLORS } from '../data/externalResources';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#E14219] flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const Section = ({ title, children }) => (
    <div>
        <h2 className="font-suisse font-bold text-xl text-[#141619] dark:text-[#E8ECF3] mb-4">
            {title}
        </h2>
        {children}
    </div>
);

const ExternalResourceDetails = () => {
    const { slug } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const resource = getResourceBySlug(slug);

    if (!resource) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#222222]">
                <p className="text-gray-500 dark:text-gray-400">Курс табылган жок.</p>
                <Link to="/resources" className="text-[#E14219] hover:underline text-sm font-medium">
                    ← Бардык курстарга кайтуу
                </Link>
            </div>
        );
    }

    const { title, provider, providerKey, level, priceLabel, certificateLabel, durationLabel, url, content, isFeatured } = resource;
    const providerColor = PROVIDER_COLORS[providerKey] ?? '#888';

    const handleOfficialLink = () => {
        const isInternal = /^\/[^/]/.test(url) || url.startsWith(window.location.origin);
        if (isInternal) {
            navigate(url.replace(window.location.origin, ''));
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#222222] text-[#141619] dark:text-[#E8ECF3]">
            <div className="px-4 py-10 sm:px-6 lg:px-12 max-w-screen-lg mx-auto">
                <Link
                    to="/resources"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-[#E14219] dark:hover:text-[#FF8C6E] mb-8 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Бардык курстарга кайтуу
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* ─── Left column ─── */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: providerColor }}
                                />
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {provider}
                                </span>
                                {isFeatured && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF8C6E] to-[#E14219] text-white">
                                        Сунушталат
                                    </span>
                                )}
                            </div>
                            <h1 className="font-suisse font-bold text-2xl sm:text-3xl leading-tight text-[#141619] dark:text-[#E8ECF3] mb-4">
                                {title}
                            </h1>
                            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                {content?.shortDescription?.ky}
                            </p>
                        </div>

                        {!user && (
                            <ExternalResourceAuthPrompt resourceSlug={slug} />
                        )}

                        <ExternalResourceDisclaimer providerName={provider} />

                        {content?.whatYouWillLearn?.ky?.length > 0 && (
                            <Section title="Эмнени үйрөнөсүз">
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                    {content.whatYouWillLearn.ky.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckIcon />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {content?.whoIsItFor?.ky?.length > 0 && (
                            <Section title="Ким үчүн">
                                <ul className="flex flex-col gap-2">
                                    {content.whoIsItFor.ky.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="text-[#E14219] mt-0.5">→</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}

                        {content?.whyRecommended?.ky && (
                            <Section title="Эмне үчүн сунушталат">
                                <div className="rounded-xl border-l-4 border-[#E14219] bg-orange-50 dark:bg-orange-900/10 pl-4 pr-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {content.whyRecommended.ky}
                                    </p>
                                </div>
                            </Section>
                        )}

                        {content?.studyPlan?.length > 0 && (
                            <Section title="Окуу планы">
                                <ol className="flex flex-col gap-3">
                                    {content.studyPlan.map((week) => (
                                        <li
                                            key={week.week}
                                            className="flex gap-4 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3"
                                        >
                                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white text-xs font-bold flex items-center justify-center">
                                                {week.week}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-sm text-[#141619] dark:text-[#E8ECF3]">
                                                    {week.title?.ky}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {week.description?.ky}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </Section>
                        )}

                        {content?.difficultyNotes?.ky?.length > 0 && (
                            <Section title="Эскертүүлөр">
                                <ul className="flex flex-col gap-1.5">
                                    {content.difficultyNotes.ky.map((note, i) => (
                                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <span className="text-yellow-500 flex-shrink-0">⚠</span>
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        )}
                    </div>

                    {/* ─── Right sidebar ─── */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-6 shadow-sm">
                            <div className="flex flex-col gap-2 text-sm">
                                {priceLabel && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Баасы</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">{priceLabel}</span>
                                    </div>
                                )}
                                {level && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Деңгээли</span>
                                        <span className="font-medium">{LEVELS[level] ?? level}</span>
                                    </div>
                                )}
                                {durationLabel && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Узактыгы</span>
                                        <span className="font-medium">{durationLabel}</span>
                                    </div>
                                )}
                                {certificateLabel && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Сертификат</span>
                                        <span className="font-medium">{certificateLabel}</span>
                                    </div>
                                )}
                            </div>

                            <hr className="border-gray-100 dark:border-white/10" />

                            <button
                                onClick={handleOfficialLink}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm px-4 py-3 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                                Расмий сайтка өтүү
                            </button>

                            <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
                                Сырткы платформага багытталасыз. Каттоо талап кылынышы мүмкүн.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExternalResourceDetails;
