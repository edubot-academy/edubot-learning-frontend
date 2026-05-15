import { useEffect, useRef, useState } from 'react';
import { submitContactMessage } from '@services/api';
import toast from 'react-hot-toast';
import PhoneInput from '@shared/ui/forms/PhoneInput';
import LeftLittleMan from '../assets/images/LeftLittleMan.png';
import { FaInstagram } from 'react-icons/fa';
import { PiTelegramLogo } from 'react-icons/pi';
import { FiMail } from 'react-icons/fi';
import { GoClock } from 'react-icons/go';
import { SlLocationPin } from 'react-icons/sl';
import { getMailToUrl, SUPPORT_CONTACT } from '@shared/config/support';
import { useTranslation } from 'react-i18next';

const CONTACT_FIELDS = [
    {
        name: 'name',
        type: 'text',
        autoComplete: 'name',
    },
    {
        name: 'email',
        type: 'email',
        autoComplete: 'email',
    },
    {
        name: 'phone',
        type: 'tel',
        autoComplete: 'tel',
        inputMode: 'numeric',
    },
];

const CONTACT_METHODS = [
    {
        label: 'Instagram',
        value: SUPPORT_CONTACT.instagramHandle,
        href: SUPPORT_CONTACT.instagramUrl,
        icon: FaInstagram,
        descriptionKey: 'instagram',
        external: true,
    },
    {
        label: 'Telegram',
        value: SUPPORT_CONTACT.telegramHandle,
        href: SUPPORT_CONTACT.telegramUrl,
        icon: PiTelegramLogo,
        descriptionKey: 'telegram',
        external: true,
    },
    {
        labelKey: 'emailLabel',
        value: SUPPORT_CONTACT.email,
        href: getMailToUrl(),
        icon: FiMail,
        descriptionKey: 'email',
    },
    {
        labelKey: 'hoursLabel',
        value: SUPPORT_CONTACT.workingHours,
        icon: GoClock,
        descriptionKey: 'hours',
    },
];

const CONTACT_FIELD_ERROR_KEYS = {
    name: 'name',
    fullName: 'name',
    email: 'email',
    phone: 'phone',
    phoneNumber: 'phone',
    message: 'message',
};

const TWO_GIS_FIRM_ID = '70000001089058889';
const TWO_GIS_MAP_URL = `https://2gis.kg/bishkek/firm/${TWO_GIS_FIRM_ID}`;
const TWO_GIS_COORDINATES = [42.843841, 74.596821];
const TWO_GIS_SCRIPT_SELECTOR = 'script[data-2gis-loader="true"]';
const TWO_GIS_SCRIPT_SRC = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
const TWO_GIS_SCRIPT_LOAD_TIMEOUT_MS = 10000;

const isTwoGisApiReady = () => window.DG && typeof window.DG.then === 'function';

const waitForTwoGisScript = (script) =>
    new Promise((resolve, reject) => {
        let timeoutId;

        const cleanup = () => {
            window.clearTimeout(timeoutId);
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
        };

        const handleLoad = () => {
            script.dataset.twoGisLoadState = 'loaded';
            cleanup();
            resolve();
        };

        const handleError = () => {
            script.dataset.twoGisLoadState = 'failed';
            cleanup();
            reject(new Error('2GIS script load error'));
        };

        timeoutId = window.setTimeout(() => {
            script.dataset.twoGisLoadState = 'failed';
            cleanup();
            reject(new Error('2GIS script load timeout'));
        }, TWO_GIS_SCRIPT_LOAD_TIMEOUT_MS);

        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });
    });

const loadTwoGisApi = () =>
    new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('2GIS map can only load in the browser.'));
            return;
        }

        if (isTwoGisApiReady()) {
            resolve();
            return;
        }

        const existingScript = document.querySelector(TWO_GIS_SCRIPT_SELECTOR);
        if (existingScript) {
            if (existingScript.dataset.twoGisLoadState === 'loading') {
                waitForTwoGisScript(existingScript).then(resolve, reject);
                return;
            }

            existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = TWO_GIS_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.dataset['2gisLoader'] = 'true';
        script.dataset.twoGisLoadState = 'loading';
        script.setAttribute('data-2gis-loader', 'true');

        document.head.appendChild(script);
        waitForTwoGisScript(script).then(resolve, reject);
    });

const getApiErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === 'string') return data;
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;

    return fallback;
};

const getApiFieldErrors = (error) => {
    const data = error?.response?.data;
    const source = data?.errors || data?.fieldErrors || data?.validationErrors;

    if (!source || typeof source !== 'object') return {};

    return Object.entries(source).reduce((acc, [key, value]) => {
        const fieldName = CONTACT_FIELD_ERROR_KEYS[key];
        if (!fieldName) return acc;

        acc[fieldName] = Array.isArray(value) ? value.join(' ') : String(value);
        return acc;
    }, {});
};

const ContactIntro = () => {
    const { t } = useTranslation();

    return (
        <>
            <div className="mb-6 mt-10">
                <h1 className="text-5xl md:text-6xl font-bold">{t('public.contact.title')}</h1>
            </div>

            <p className="mb-10 text-lg text-gray-700 dark:text-[#a6adba]">
                {t('public.contact.intro')}
            </p>

            <div className="mb-8 grid gap-3 text-sm text-gray-700 sm:grid-cols-2 dark:text-[#a6adba]">
                <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 dark:border-orange-900/40 dark:bg-orange-950/20">
                    {t('public.contact.responseTime')}
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-[#222222]">
                    {t('public.contact.privacy')}
                </div>
            </div>
        </>
    );
};

const ContactField = ({ field, value, error, onChange }) => {
    const { t } = useTranslation();
    const { name, type, autoComplete, inputMode } = field;
    const label = t(`public.contact.fields.${name}`);
    const inputId = `contact-${name}`;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error);

    return (
        <div>
            <label htmlFor={inputId} className="block font-medium mb-1">
                {label}
            </label>
            {name === 'phone' ? (
                <PhoneInput
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={(nextValue) => onChange({ target: { name, value: nextValue } })}
                    autoComplete={autoComplete}
                    allowPlus={true}
                    maxLength={16}
                    required
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`rounded-[10px] px-3 transition focus:ring-2 focus:ring-[#E14219] dark:placeholder-gray-400 ${
                        hasError
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-black dark:border-white'
                    }`}
                />
            ) : (
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    required
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`w-full border rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219] transition bg-white dark:bg-[#222222] dark:text-white dark:placeholder-gray-400 ${
                        hasError
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-black dark:border-white'
                    }`}
                />
            )}
            {hasError && (
                <p id={errorId} className="mt-1 text-sm text-red-600 dark:text-red-300">
                    {error}
                </p>
            )}
            {name === 'phone' && !hasError && (
                <p className="mt-1 text-sm text-gray-500 dark:text-[#a6adba]">
                    {t('public.contact.phoneHelper')}
                </p>
            )}
        </div>
    );
};

const ContactForm = ({ formData, errors, isSubmitting, onChange, onSubmit }) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={onSubmit} className="space-y-5 max-w-xl" noValidate>
            {CONTACT_FIELDS.map((field) => (
                <ContactField
                    key={field.name}
                    field={field}
                    value={formData[field.name]}
                    error={errors[field.name]}
                    onChange={onChange}
                />
            ))}

            <div>
                <label htmlFor="contact-message" className="block font-medium mb-1">
                    {t('public.contact.fields.message')}
                </label>
                <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={onChange}
                    rows={4}
                    required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className={`w-full border rounded-[10px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E14219] transition bg-white dark:bg-[#222222] dark:text-white dark:placeholder-gray-400 ${
                        errors.message
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-black dark:border-white'
                    }`}
                ></textarea>
                {errors.message && (
                    <p
                        id="contact-message-error"
                        className="mt-1 text-sm text-red-600 dark:text-red-300"
                    >
                        {errors.message}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="inline-flex h-[56px] min-w-[156px] items-center justify-center gap-2 rounded-[8px] bg-[#E14219] px-5 font-medium text-white shadow-lg shadow-[#FF8C6E]/90 transition hover:bg-[#d63915] disabled:cursor-not-allowed disabled:opacity-75 dark:hover:bg-[#c83413]"
            >
                {isSubmitting && (
                    <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true"
                    />
                )}
                {isSubmitting ? t('public.contact.submitting') : t('public.contact.submit')}
            </button>
        </form>
    );
};

const SupportPanel = () => {
    const { t } = useTranslation();
    const supportSteps = t('public.contact.supportSteps', { returnObjects: true });

    return (
        <aside className="hidden lg:block sticky top-28">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-orange-100/60 dark:border-gray-700 dark:bg-[#222222] dark:shadow-none">
                <div className="flex justify-center">
                    <img
                        src={LeftLittleMan}
                        alt=""
                        aria-hidden="true"
                        className="max-h-72 w-auto object-contain"
                        width="288"
                        height="288"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t('public.contact.afterTitle')}
                    </h2>
                    <div className="mt-4 space-y-3">
                        {supportSteps.map((step, index) => (
                            <div
                                key={step}
                                className="flex gap-3 rounded-2xl bg-orange-50/70 p-3 dark:bg-orange-950/20"
                            >
                                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EA580C] text-sm font-semibold text-white">
                                    {index + 1}
                                </span>
                                <p className="text-sm leading-6 text-gray-700 dark:text-[#a6adba]">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

const ContactMethodsSection = () => {
    const { t } = useTranslation();

    return (
        <section
            className="w-full max-w-[1739px] mx-auto px-4 md:px-10 mt-10"
            aria-labelledby="contact-methods-title"
        >
            <div className="mb-10">
                <h2
                    id="contact-methods-title"
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                    {t('public.contact.methodsTitle')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-[#a6adba]">
                    {t('public.contact.methodsSubtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-base mb-12 md:grid-cols-2 xl:grid-cols-4">
                {CONTACT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const methodLabel = method.labelKey
                        ? t(`public.contact.methods.${method.labelKey}`)
                        : method.label;
                    const content = (
                        <>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C] dark:bg-orange-950/30 dark:text-orange-300">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <p className="font-semibold text-[#EA580C] dark:text-orange-400">
                                    {methodLabel}
                                </p>
                            </div>
                            <p className="mt-4 break-words text-sm font-medium text-gray-900 dark:text-white">
                                {method.value}
                            </p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-[#a6adba]">
                                {t(`public.contact.methods.${method.descriptionKey}`)}
                            </p>
                        </>
                    );

                    return method.href ? (
                        <a
                            key={methodLabel}
                            href={method.href}
                            target={method.external ? '_blank' : undefined}
                            rel={method.external ? 'noopener noreferrer' : undefined}
                            className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#EA580C] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:border-gray-700 dark:bg-[#222222]"
                        >
                            {content}
                        </a>
                    ) : (
                        <div
                            key={methodLabel}
                            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#222222]"
                        >
                            {content}
                        </div>
                    );
                })}
            </div>

            <LocationSection />
        </section>
    );
};

const TwoGisMapWidget = () => {
    const { t } = useTranslation();
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const initializeMap = async () => {
            try {
                setFailed(false);
                await loadTwoGisApi();
                if (cancelled) return;

                window.DG.then(() => {
                    try {
                        if (cancelled || !mapContainerRef.current) return;

                        if (mapInstanceRef.current) {
                            try {
                                mapInstanceRef.current.remove();
                            } catch (error) {
                                console.warn('Failed to remove 2GIS map:', error);
                            }
                            mapInstanceRef.current = null;
                        }

                        const map = window.DG.map(mapContainerRef.current, {
                            center: TWO_GIS_COORDINATES,
                            zoom: 19,
                        });

                        const marker = window.DG.marker(TWO_GIS_COORDINATES).addTo(map);
                        marker.bindPopup(SUPPORT_CONTACT.addressFull);

                        mapInstanceRef.current = map;
                        markerRef.current = marker;
                    } catch (error) {
                        console.warn('2GIS map failed to initialize:', error);
                        if (!cancelled) setFailed(true);
                    }
                });
            } catch (error) {
                console.warn('2GIS map failed to initialize:', error);
                if (!cancelled) setFailed(true);
            }
        };

        initializeMap();

        return () => {
            cancelled = true;

            if (mapInstanceRef.current?.remove) {
                try {
                    mapInstanceRef.current.remove();
                } catch (error) {
                    console.warn('Failed to remove 2GIS map:', error);
                }
            }
            mapInstanceRef.current = null;
            markerRef.current = null;
        };
    }, []);

    if (failed) {
        return (
            <div className="relative h-[400px] max-w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#222222]">
                <iframe
                    title={t('public.contact.fallbackMapTitle')}
                    src={`https://www.google.com/maps?q=${TWO_GIS_COORDINATES[0]},${TWO_GIS_COORDINATES[1]}&output=embed`}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                />
                <div className="absolute left-4 top-4 rounded-xl bg-white/90 px-4 py-3 text-sm text-gray-700 shadow-lg dark:bg-[#222222]/90 dark:text-[#d1d5db]">
                    {t('public.contact.fallbackMapNotice')}
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[400px] max-w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-[#222222]">
            <div
                ref={mapContainerRef}
                className="absolute inset-0 h-full w-full"
                aria-label={t('public.contact.mapAria')}
            />
        </div>
    );
};

const LocationSection = () => {
    const { t } = useTranslation();

    return (
        <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="font-inter flex items-center gap-2">
                        <SlLocationPin className="h-5 w-5 text-[#EA580C] dark:text-orange-300" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('public.contact.locationTitle')}
                        </h2>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-[#a6adba]">
                        {SUPPORT_CONTACT.addressFull}
                    </p>
                </div>
                <a
                    href={TWO_GIS_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#EA580C] px-4 text-sm font-semibold text-[#EA580C] transition hover:bg-[#EA580C] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#EA580C] dark:border-orange-400 dark:text-orange-300"
                >
                    {t('public.contact.openMap')}
                </a>
            </div>

            <TwoGisMapWidget />
            <p className="mt-2 text-sm text-gray-600 dark:text-[#a6adba]">
                {t('public.contact.mapFallbackPrefix')}{' '}
                <a
                    href={TWO_GIS_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#EA580C] underline-offset-4 hover:underline dark:text-orange-300"
                >
                    {t('public.contact.mapFallbackLink')}
                </a>
                .
            </p>
        </>
    );
};

const ContactPage = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (formData.name.trim().length < 2) {
            newErrors.name = t('public.contact.validation.name');
        }

        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email.trim())) {
            newErrors.email = t('public.contact.validation.email');
        }

        if (!/^\+\d{10,15}$/.test(formData.phone.trim())) {
            newErrors.phone = t('public.contact.validation.phone');
        }

        if (!formData.message.trim()) {
            newErrors.message = t('public.contact.validation.message');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            if (!/^\+?\d*$/.test(value)) return;
            if (value.length > 16) return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await submitContactMessage({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                message: formData.message.trim(),
            });
            toast.success(t('public.contact.success'));
            setFormData({ name: '', email: '', phone: '', message: '' });
            setErrors({});
        } catch (error) {
            const apiFieldErrors = getApiFieldErrors(error);

            if (Object.keys(apiFieldErrors).length > 0) {
                setErrors(apiFieldErrors);
            }

            toast.error(getApiErrorMessage(error, t('public.contact.fallbackError')));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12 md:px-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr),minmax(21rem,0.78fr)] lg:gap-16">
                <div className="max-w-2xl">
                    <ContactIntro />
                    <ContactForm
                        formData={formData}
                        errors={errors}
                        isSubmitting={isSubmitting}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                    />
                </div>

                <SupportPanel />
            </div>

            <ContactMethodsSection />
        </div>
    );
};

export default ContactPage;
