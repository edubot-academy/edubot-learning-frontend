import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAuthAcquisitionPath } from '@shared/auth-config';

const ExternalResourceAuthPrompt = ({ resourceSlug, resourceTitle }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSave = () => {
        if (resourceSlug) {
            try {
                localStorage.setItem(
                    'pendingAction',
                    JSON.stringify({
                        type: 'save-resource',
                        slug: resourceSlug,
                        resourceTitle: resourceTitle ?? resourceSlug,
                        timestamp: Date.now(),
                    })
                );
            } catch {
                // storage not available
            }
        }
        navigate(getAuthAcquisitionPath(), {
            state: { from: `/resources/${resourceSlug}` },
        });
    };

    return (
        <div className="rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
                <p className="font-semibold text-[#141619] dark:text-[#E8ECF3] text-sm">
                    {t('public.externalResources.authPromptTitle')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('public.externalResources.authPromptBody')}
                </p>
            </div>
            <button
                onClick={handleSave}
                className="flex-shrink-0 inline-flex items-center justify-center rounded-lg font-medium text-sm px-5 py-2.5 bg-gradient-to-b from-[#FF8C6E] to-[#E14219] text-white hover:from-[#C2410C] hover:to-[#C2410C] transition-all duration-300 active:scale-95"
            >
                {t('public.externalResources.save')}
            </button>
        </div>
    );
};

export default ExternalResourceAuthPrompt;
