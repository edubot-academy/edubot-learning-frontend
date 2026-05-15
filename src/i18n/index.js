import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, getResolvedLocale, SUPPORTED_LOCALES } from './locale';
import { resources } from './resources';

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources,
        lng: getResolvedLocale(),
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: SUPPORTED_LOCALES,
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });
}

export default i18n;
