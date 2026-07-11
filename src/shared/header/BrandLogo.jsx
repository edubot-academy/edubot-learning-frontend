import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EduBotLogo from '@assets/images/edubot-signup.png';

const BrandLogo = ({ compact = false }) => {
    const { t } = useTranslation();

    if (compact) {
        return (
            <Link to="/" className="flex flex-col items-center">
                <div className="h-12 w-12">
                    <img
                        src={EduBotLogo}
                        alt={t('common.appName')}
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="flex flex-col items-center mt-1">
                    <span className="text-lg font-bold text-orange-500 dark:text-orange-400">
                        EDUBOT
                    </span>
                    <span className="text-xs -mt-1 text-gray-700 dark:text-gray-300 tracking-[0.14em]">
                        LEARNING
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <Link to="/" className="flex items-center max-w-[191px] w-full">
            <div className="h-16 w-16 md:h-20 md:w-20 ">
                <img
                    src={EduBotLogo}
                    alt={t('common.appName')}
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="flex flex-col ml-3">
                <span className="text-2xl font-bold text-orange-500 dark:text-orange-400">
                    EDUBOT
                </span>
                <span className="text-base -mt-2 text-gray-700 dark:text-gray-300 tracking-[0.14em]">
                    LEARNING
                </span>
            </div>
        </Link>
    );
};

export default BrandLogo;
