import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FiActivity,
    FiAward,
    FiBookOpen,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiMail,
    FiPhone,
    FiSearch,
    FiX,
    FiUsers,
} from 'react-icons/fi';
import {
    DashboardInsetPanel,
    DashboardMetricCard,
    DashboardSectionHeader,
    DashboardTableSkeleton,
    EmptyState,
} from '@components/ui/dashboard';
import { BasicModal } from '@shared/ui';
import {
    downloadCourseCertificatePdf,
    fetchCourseCertificatePreviewHtml,
} from '@features/courses/api';
import {
    PreviewCornerOrnament,
    PreviewOrnamentBand,
    PreviewTundukSeal,
} from './CertificatePreviewArt';
import { isPlatformAdmin } from '@shared/utils/roles';
import { getCertificateStatusLabel, getPageOrientationLabel } from '@shared/i18n/enumLabels';

const formatDate = (value, language = 'ky') => {
    if (!value) return '—';
    const date = new Date(value);
    const locale = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'ky-KG';
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          });
};

const getCertificatePreviewLocale = (language) =>
    language === 'ru' ? 'ru-RU' : language === 'ky' ? 'ky-KG' : 'en-GB';

const formatPreviewDate = (value, language = 'en') =>
    new Date(value).toLocaleDateString(getCertificatePreviewLocale(language), {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

const normalizeExactPreviewHtml = (html) => {
    if (!html || typeof html !== 'string') return '';

    const fitStyles = `
        <style id="edubot-preview-fit">
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                background: #ffffff !important;
                overflow: hidden !important;
            }
            body > * {
                margin-left: auto !important;
                margin-right: auto !important;
                max-width: none !important;
                flex: 0 0 auto !important;
            }
        </style>
    `;
    const fitScript = `
        <script id="edubot-preview-fit-script">
            (function () {
                function getRootNode() {
                    if (!document.body) return null;
                    var children = document.body.children || [];
                    for (var index = 0; index < children.length; index += 1) {
                        var tagName = children[index].tagName;
                        if (!/^(STYLE|SCRIPT|META|LINK)$/i.test(tagName)) {
                            return children[index];
                        }
                    }
                    return null;
                }

                function fitPreview() {
                    var root = getRootNode();
                    if (!root) return;

                    root.style.transform = 'none';
                    root.style.transformOrigin = 'top center';
                    root.style.position = 'absolute';
                    root.style.left = '50%';
                    root.style.top = '0';
                    root.style.margin = '0';

                    var baseWidth = root.scrollWidth || root.offsetWidth;
                    var baseHeight = root.scrollHeight || root.offsetHeight;
                    var availableWidth = Math.max(window.innerWidth - 24, 260);
                    var availableHeight = Math.max(window.innerHeight - 24, 260);

                    if (!baseWidth || !baseHeight) return;

                    var isModalPreview = window.frameElement && window.frameElement.dataset.previewSurface === 'modal';
                    var modalFitHeight = Math.max(window.innerHeight - 24, 260);
                    var fitHeight = isModalPreview ? modalFitHeight : availableHeight;
                    var scale = Math.min(availableWidth / baseWidth, fitHeight / baseHeight, 1);
                    var scaledHeight = baseHeight * scale;
                    var topOffset = isModalPreview ? Math.max((window.innerHeight - scaledHeight) / 2, 0) : 0;

                    root.style.top = topOffset + 'px';
                    root.style.transform = 'translateX(-50%) scale(' + scale + ')';
                    document.documentElement.style.height = Math.ceil(isModalPreview ? window.innerHeight : scaledHeight) + 'px';
                    document.body.style.height = Math.ceil(isModalPreview ? window.innerHeight : scaledHeight) + 'px';
                }

                window.addEventListener('load', fitPreview);
                window.addEventListener('resize', fitPreview);
                setTimeout(fitPreview, 0);
                setTimeout(fitPreview, 120);
            })();
        </script>
    `;

    const withViewport = html.includes('name="viewport"')
        ? html
        : html.replace(
              /<head([^>]*)>/i,
              '<head$1><meta name="viewport" content="width=device-width, initial-scale=1" />'
          );

    if (/<head[^>]*>/i.test(withViewport)) {
        return withViewport.replace(/<\/head>/i, `${fitStyles}${fitScript}</head>`);
    }

    return `${fitStyles}${fitScript}${withViewport}`;
};

const getPreviewRootNode = (doc) => {
    if (!doc?.body) return null;
    return Array.from(doc.body.children).find(
        (child) => !['STYLE', 'SCRIPT', 'META', 'LINK'].includes(child.tagName)
    );
};

const fitExactPreviewFrame = (iframe) => {
    const fit = () => {
        const doc = iframe?.contentDocument;
        const root = getPreviewRootNode(doc);
        if (!iframe || !doc || !root) return;

        const availableWidth = Math.max(iframe.clientWidth - 24, 260);
        const availableHeight = Math.max(iframe.clientHeight - 24, 260);

        doc.documentElement.style.margin = '0';
        doc.documentElement.style.padding = '0';
        doc.documentElement.style.width = '100%';
        doc.documentElement.style.overflow = 'hidden';
        doc.body.style.margin = '0';
        doc.body.style.padding = '0';
        doc.body.style.width = '100%';
        doc.body.style.overflow = 'hidden';
        doc.body.style.background = '#ffffff';

        root.style.transform = 'none';
        root.style.transformOrigin = 'top left';
        root.style.position = 'absolute';
        root.style.left = '0';
        root.style.top = '0';
        root.style.margin = '0';
        root.style.maxWidth = 'none';

        const rect = root.getBoundingClientRect();
        const baseWidth = Math.max(root.scrollWidth, root.offsetWidth, rect.width);
        const baseHeight = Math.max(root.scrollHeight, root.offsetHeight, rect.height);
        if (!baseWidth || !baseHeight) return;

        const scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight, 1);
        const scaledWidth = baseWidth * scale;
        const scaledHeight = baseHeight * scale;
        const leftOffset = Math.max((iframe.clientWidth - scaledWidth) / 2, 0);
        const topOffset = Math.max((iframe.clientHeight - scaledHeight) / 2, 0);

        root.style.left = `${leftOffset}px`;
        root.style.top = `${topOffset}px`;
        root.style.transform = `scale(${scale})`;
        doc.documentElement.style.height = `${iframe.clientHeight}px`;
        doc.body.style.height = `${iframe.clientHeight}px`;
    };

    const scheduleFit = () => window.requestAnimationFrame(fit);
    const timeouts = [0, 80, 240].map((delay) => window.setTimeout(scheduleFit, delay));
    const resizeObserver =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleFit);

    resizeObserver?.observe(iframe);
    if (iframe.parentElement) {
        resizeObserver?.observe(iframe.parentElement);
    }
    window.addEventListener('resize', scheduleFit);
    iframe.contentWindow?.addEventListener('resize', scheduleFit);

    return () => {
        timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
        resizeObserver?.disconnect();
        window.removeEventListener('resize', scheduleFit);
        iframe.contentWindow?.removeEventListener('resize', scheduleFit);
    };
};

const getCertificateBadge = (status) => {
    if (status === 'issued') {
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
    }
    if (status === 'pending_approval') {
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    }
    if (status === 'rejected') {
        return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
    }
    if (status === 'revoked') {
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
};

const getStudentCertificateStatusLabel = (status, t) =>
    getCertificateStatusLabel(status, t);

const getStudentCertificateState = (student, canIssueManually = true, t) => {
    const progress = Math.max(0, Math.min(100, Number(student?.progressPercent || 0)));
    const eligibility = student?.certificateEligibility;
    const isComplete =
        Boolean(student?.certificateEligible) ||
        Boolean(student?.completed) ||
        progress >= 100;

    if (student?.certificateStatus === 'issued') {
        return {
            canIssue: false,
            buttonLabel: t('adminCertificates.state.issued.button'),
            helperText: t('adminCertificates.state.issued.helper'),
            helperTone: 'text-emerald-600 dark:text-emerald-300',
        };
    }

    if (student?.certificateStatus === 'pending_approval') {
        return {
            canIssue: false,
            buttonLabel: t('adminCertificates.state.pending.button'),
            helperText: t('adminCertificates.state.pending.helper'),
            helperTone: 'text-amber-600 dark:text-amber-300',
        };
    }

    if (!isComplete) {
        const missing = Array.isArray(eligibility?.reasons) && eligibility.reasons.length
            ? eligibility.reasons
                  .map((reason) => {
                      if (reason === 'sessions_missing') return t('adminCertificates.eligibilityReasons.sessionsMissing');
                      if (reason === 'sessions_incomplete') return t('adminCertificates.eligibilityReasons.sessionsIncomplete');
                      if (reason === 'attendance_below_threshold') return t('adminCertificates.eligibilityReasons.attendanceBelowThreshold');
                      if (reason === 'homework_below_threshold') return t('adminCertificates.eligibilityReasons.homeworkBelowThreshold');
                      if (reason === 'activities_below_threshold') return t('adminCertificates.eligibilityReasons.activitiesBelowThreshold');
                      if (reason === 'lesson_progress_incomplete') return t('adminCertificates.eligibilityReasons.lessonProgressIncomplete');
                      return null;
                  })
                  .filter(Boolean)
                  .join(', ')
            : '';
        return {
            canIssue: canIssueManually,
            buttonLabel: canIssueManually
                ? t('adminCertificates.actions.issue')
                : t('adminCertificates.state.incomplete.requirementsButton'),
            helperText: canIssueManually
                ? missing
                    ? t('adminCertificates.state.incomplete.manualWithMissing', { missing })
                    : t('adminCertificates.state.incomplete.manualWithProgress', { progress })
                : missing
                  ? t('adminCertificates.state.incomplete.blockedWithMissing', { missing })
                  : t('adminCertificates.state.incomplete.blockedWithProgress', { progress }),
            helperTone: 'text-amber-600 dark:text-amber-300',
        };
    }

    if (student?.certificateStatus === 'rejected') {
        return {
            canIssue: canIssueManually,
            buttonLabel: canIssueManually
                ? t('adminCertificates.actions.reissue')
                : t('adminCertificates.status.rejected'),
            helperText: canIssueManually
                ? t('adminCertificates.state.rejected.manualHelper')
                : t('adminCertificates.state.rejected.helper'),
            helperTone: 'text-red-600 dark:text-red-300',
        };
    }

    if (student?.certificateStatus === 'revoked') {
        return {
            canIssue: canIssueManually,
            buttonLabel: canIssueManually
                ? t('adminCertificates.actions.reissue')
                : t('adminCertificates.status.revoked'),
            helperText: canIssueManually
                ? t('adminCertificates.state.revoked.manualHelper')
                : t('adminCertificates.state.revoked.helper'),
            helperTone: 'text-slate-600 dark:text-slate-300',
        };
    }

    return {
        canIssue: canIssueManually,
        buttonLabel: canIssueManually
            ? t('adminCertificates.actions.issue')
            : t('adminCertificates.state.ready.button'),
        helperText: canIssueManually
            ? t('adminCertificates.state.ready.manualHelper')
            : t('adminCertificates.state.ready.helper'),
        helperTone: 'text-emerald-600 dark:text-emerald-300',
    };
};

const SignaturePad = ({ disabled = false, onSave }) => {
    const { t } = useTranslation();
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef(null);
    const [hasStroke, setHasStroke] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const root = document.documentElement;
        const syncTheme = () => setIsDarkMode(root.classList.contains('dark'));
        syncTheme();
        const observer = new MutationObserver(syncTheme);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1f2937';
    }, [isDarkMode]);

    const getPoint = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    }, []);

    const clearPad = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        isDrawingRef.current = false;
        lastPointRef.current = null;
        setHasStroke(false);
    }, []);

    const beginStroke = useCallback(
        (event) => {
            if (disabled) return;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            const point = getPoint(event);
            if (!canvas || !ctx || !point) return;
            isDrawingRef.current = true;
            lastPointRef.current = point;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x + 0.01, point.y + 0.01);
            ctx.stroke();
            setHasStroke(true);
            canvas.setPointerCapture?.(event.pointerId);
        },
        [disabled, getPoint]
    );

    const moveStroke = useCallback(
        (event) => {
            if (disabled || !isDrawingRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            const point = getPoint(event);
            if (!canvas || !ctx || !point) return;
            const lastPoint = lastPointRef.current || point;
            ctx.beginPath();
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            lastPointRef.current = point;
        },
        [disabled, getPoint]
    );

    const endStroke = useCallback(
        (event) => {
            if (disabled) return;
            isDrawingRef.current = false;
            lastPointRef.current = null;
            canvasRef.current?.releasePointerCapture?.(event.pointerId);
        },
        [disabled]
    );

    const savePad = useCallback(async () => {
        const canvas = canvasRef.current;
        if (disabled || !canvas || !hasStroke) return;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) return;
        await onSave?.(
            new File([blob], `signature-drawn-${Date.now()}.png`, {
                type: 'image/png',
            })
        );
    }, [disabled, hasStroke, onSave]);

    return (
        <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-edubot-ink dark:text-slate-200">
                        {t('adminCertificates.signaturePad.title')}
                    </p>
                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                        {t('adminCertificates.signaturePad.description')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="dashboard-button-secondary"
                        onClick={clearPad}
                        disabled={disabled || !hasStroke}
                    >
                        {t('adminCertificates.signaturePad.clear')}
                    </button>
                    <button
                        type="button"
                        className="dashboard-button-secondary"
                        onClick={savePad}
                        disabled={disabled || !hasStroke}
                    >
                        {t('adminCertificates.signaturePad.save')}
                    </button>
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={960}
                height={260}
                className={`mt-4 h-40 w-full rounded-2xl border border-edubot-line/70 bg-[#fffdf8] ${
                    disabled ? 'cursor-not-allowed opacity-70' : 'cursor-crosshair'
                } touch-none dark:border-slate-700`}
                style={{
                    backgroundImage: `linear-gradient(to bottom, transparent calc(50% - 0.5px), ${
                        isDarkMode ? 'rgba(148, 163, 184, 0.42)' : 'rgba(148, 163, 184, 0.3)'
                    } calc(50% - 0.5px), ${
                        isDarkMode ? 'rgba(148, 163, 184, 0.42)' : 'rgba(148, 163, 184, 0.3)'
                    } calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
                }}
                onPointerDown={beginStroke}
                onPointerMove={moveStroke}
                onPointerUp={endStroke}
                onPointerLeave={endStroke}
                onPointerCancel={endStroke}
            />
        </div>
    );
};

const getTemplatePayload = (settingsForm, isAdminMode, defaultCertificateTitle) => ({
    certificateTitle: isAdminMode
        ? settingsForm.certificateTitle.trim() || defaultCertificateTitle
        : undefined,
    secondaryBrandName: isAdminMode ? settingsForm.secondaryBrandName.trim() || null : undefined,
    certificateLanguage: isAdminMode ? settingsForm.certificateLanguage : undefined,
    pageOrientation: isAdminMode ? settingsForm.pageOrientation : undefined,
    primaryColor: isAdminMode ? settingsForm.primaryColor : undefined,
    accentColor: isAdminMode ? settingsForm.accentColor : undefined,
    eligibilityAttendanceRequired: isAdminMode
        ? Boolean(settingsForm.eligibilityAttendanceRequired)
        : undefined,
    eligibilityAttendancePercent: isAdminMode
        ? Number(settingsForm.eligibilityAttendancePercent || 0)
        : undefined,
    eligibilityHomeworkRequired: isAdminMode
        ? Boolean(settingsForm.eligibilityHomeworkRequired)
        : undefined,
    eligibilityHomeworkPercent: isAdminMode
        ? Number(settingsForm.eligibilityHomeworkPercent || 0)
        : undefined,
    eligibilityActivitiesRequired: isAdminMode
        ? Boolean(settingsForm.eligibilityActivitiesRequired)
        : undefined,
    eligibilityActivitiesPercent: isAdminMode
        ? Number(settingsForm.eligibilityActivitiesPercent || 0)
        : undefined,
});

const CERTIFICATE_LANGUAGE_OPTIONS = [
    { value: 'en', labelKey: 'adminCertificates.page.template.languageOptions.en' },
    { value: 'ru', labelKey: 'adminCertificates.page.template.languageOptions.ru' },
    { value: 'ky', labelKey: 'adminCertificates.page.template.languageOptions.ky' },
];

const DEFAULT_CERTIFICATE_LANGUAGE = 'en';

const ReadOnlyField = ({ label, value, children, className = '' }) => (
    <div className={className}>
        <p className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
            {label}
        </p>
        <div className="min-h-11 rounded-2xl border border-edubot-line/70 bg-white/70 px-4 py-3 text-sm font-semibold text-edubot-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-slate-700 dark:bg-slate-950/40 dark:text-white">
            {children || value || '—'}
        </div>
    </div>
);

const getPreviewLanguageCopy = (t, language) => ({
    mainTitle: t('adminCertificates.previewCanvas.mainTitle', { lng: language }),
    supportingText: t('adminCertificates.previewCanvas.supportingText', { lng: language }),
    issuedLabel: t('adminCertificates.previewCanvas.issuedLabel', { lng: language }),
    verificationLabel: t('adminCertificates.previewCanvas.verificationLabel', { lng: language }),
    fallbackTitle: t('adminCertificates.previewCanvas.fallbackTitle', { lng: language }),
    partnershipLabel: t('adminCertificates.previewCanvas.partnershipLabel', { lng: language }),
    certifiesLabel: t('adminCertificates.previewCanvas.certifiesLabel', { lng: language }),
    secondaryBrandLogoAlt: t('adminCertificates.previewCanvas.secondaryBrandLogoAlt', {
        lng: language,
    }),
    signatureAlt: t('adminCertificates.previewCanvas.signatureAlt', { lng: language }),
});

const CertificatePreviewCanvas = ({
    settingsForm,
    isPortraitPreview,
    previewStudentName,
    previewCourseTitle,
    previewIssuerName,
    previewIssuerTitle,
    previewDate,
    expanded = false,
    compact = false,
}) => {
    const { t } = useTranslation();
    const copy = getPreviewLanguageCopy(t, settingsForm.certificateLanguage);
    return (
        <div
            className={`relative mx-auto overflow-hidden rounded-[24px] ${
                expanded
                    ? isPortraitPreview
                        ? 'max-w-[560px] min-h-[860px] p-8'
                        : 'max-w-[1120px] min-h-[720px] p-10'
                    : compact
                      ? isPortraitPreview
                          ? 'max-w-[300px] min-h-[470px] p-4'
                          : 'max-w-[380px] min-h-[300px] p-4'
                      : isPortraitPreview
                        ? 'max-w-[380px] min-h-[620px] p-6'
                        : 'min-h-[430px] p-6'
            } bg-[#fffaf0]`}
            style={{
                border: `2px solid ${settingsForm.primaryColor}`,
                boxShadow: `0 24px 60px ${settingsForm.accentColor}20, inset 0 0 0 6px #f8f2e5, inset 0 0 0 8px ${settingsForm.accentColor}`,
            }}
        >
            <div
                className={`absolute inset-x-0 top-0 ${expanded ? 'h-24' : 'h-16'}`}
                style={{ backgroundColor: settingsForm.primaryColor }}
            />
            <div
                className={`absolute ${expanded ? 'inset-7 rounded-[24px]' : 'inset-5 rounded-[20px]'} border-2`}
                style={{ borderColor: settingsForm.accentColor }}
            />
            <div
                className={`absolute ${expanded ? 'inset-12 rounded-[20px]' : 'inset-9 rounded-[18px]'} border`}
                style={{ borderColor: `${settingsForm.primaryColor}80` }}
            />
            <div
                className={`absolute ${expanded ? 'inset-8' : 'inset-6'} opacity-10`}
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent 0 18px, ${settingsForm.primaryColor} 18px 20px, transparent 20px 38px), repeating-linear-gradient(-45deg, transparent 0 18px, ${settingsForm.accentColor} 18px 20px, transparent 20px 38px)`,
                }}
            />
            <PreviewOrnamentBand
                color={settingsForm.accentColor}
                className={`absolute ${expanded ? 'left-16 right-16 top-24 h-4' : 'left-12 right-12 top-16 h-3'}`}
            />
            <PreviewOrnamentBand
                color={settingsForm.accentColor}
                className={`absolute ${expanded ? 'bottom-8 left-16 right-16 h-4 opacity-90' : 'bottom-6 left-12 right-12 h-3 opacity-90'}`}
            />
            {[
                'left-3 top-3 rotate-90',
                'right-3 top-3 rotate-180',
                'left-3 bottom-3',
                'right-3 bottom-3 -rotate-90',
            ].map((position) => (
                <PreviewCornerOrnament
                    key={position}
                    className={`absolute ${expanded ? 'h-24 w-24' : 'h-16 w-16'} ${position}`}
                    color={settingsForm.accentColor}
                />
            ))}
            <div className="relative">
                <p
                    className={`text-center font-semibold uppercase ${
                        expanded ? 'text-sm tracking-[0.38em]' : 'text-xs tracking-[0.28em]'
                    } text-slate-900`}
                >
                    EduBot Learning
                </p>
                <div
                    className={`rounded-[22px] ${
                        expanded ? 'mt-20 px-8 py-10' : 'mt-14 px-5 py-6'
                    } border border-slate-200 bg-white/90 text-slate-900`}
                >
                    <p
                        className={`text-center font-semibold uppercase text-slate-500 ${expanded ? 'text-xs tracking-[0.24em]' : 'text-[11px] tracking-[0.2em]'}`}
                    >
                        {settingsForm.certificateTitle.trim() || copy.fallbackTitle}
                    </p>
                    <h3
                        className={`mt-3 text-center font-bold uppercase ${
                            expanded
                                ? isPortraitPreview
                                    ? 'text-3xl'
                                    : 'text-5xl'
                                : isPortraitPreview
                                  ? 'text-xl'
                                  : 'text-2xl'
                        }`}
                        style={{
                            letterSpacing: isPortraitPreview ? '0.14em' : '0.18em',
                        }}
                    >
                        {copy.mainTitle}
                    </h3>
                    <div
                        className={`mx-auto opacity-90 ${expanded ? 'mt-4 h-5 w-56' : 'mt-3 h-4 w-40'}`}
                    >
                        <div
                            className="h-full w-full"
                            style={{
                                background: `linear-gradient(90deg, transparent 0 8%, ${settingsForm.accentColor} 8% 42%, transparent 42% 58%, ${settingsForm.accentColor} 58% 92%, transparent 92% 100%)`,
                            }}
                        />
                    </div>
                    {settingsForm.secondaryBrandName.trim() ||
                    settingsForm.secondaryBrandLogoUrl ? (
                        <div
                            className={`${expanded ? 'mt-5 gap-4' : 'mt-3 gap-3'} flex flex-col items-center`}
                        >
                            {settingsForm.secondaryBrandLogoUrl ? (
                                <img
                                    src={settingsForm.secondaryBrandLogoUrl}
                                    alt={copy.secondaryBrandLogoAlt}
                                    className={`${expanded ? 'max-h-14 max-w-[220px]' : 'max-h-10 max-w-[160px]'} object-contain`}
                                />
                            ) : null}
                            {settingsForm.secondaryBrandName.trim() ? (
                                <p
                                    className={`text-center text-slate-500 ${expanded ? 'text-base' : 'text-sm'}`}
                                >
                                    {copy.partnershipLabel}{' '}
                                    <span className="font-semibold text-slate-900">
                                        {settingsForm.secondaryBrandName.trim()}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                    <p
                        className={`text-center text-slate-500 ${expanded ? 'mt-7 text-lg' : 'mt-5 text-sm'}`}
                    >
                        {copy.certifiesLabel}
                    </p>
                    <p
                        className={`text-center font-bold text-slate-900 ${
                            expanded
                                ? isPortraitPreview
                                    ? 'mt-5 text-5xl'
                                    : 'mt-6 text-6xl'
                                : isPortraitPreview
                                  ? 'mt-4 text-2xl'
                                  : 'mt-4 text-3xl'
                        }`}
                        style={{ letterSpacing: '0.04em' }}
                    >
                        {previewStudentName}
                    </p>
                    <div
                        className={`mx-auto ${expanded ? 'mt-5 h-[2px] w-80' : 'mt-3 h-px w-44'}`}
                        style={{ backgroundColor: settingsForm.primaryColor }}
                    />
                    <p
                        className={`text-center text-slate-500 ${expanded ? 'mt-8 text-lg' : 'mt-5 text-sm'}`}
                    >
                        {copy.supportingText}
                    </p>
                    <p
                        className={`text-center font-semibold text-slate-900 ${expanded ? 'mt-4 text-4xl' : 'mt-3 text-xl'}`}
                    >
                        {previewCourseTitle}
                    </p>
                    <div
                        className={`relative mx-auto ${expanded ? 'mt-6 h-8 w-72' : 'mt-4 h-5 w-52'}`}
                    >
                        <div
                            className="absolute left-0 top-1/2 h-[2px] w-[42%] -translate-y-1/2"
                            style={{
                                background: `linear-gradient(90deg, transparent 0, ${settingsForm.accentColor} 35%, ${settingsForm.primaryColor} 100%)`,
                            }}
                        />
                        <div
                            className="absolute right-0 top-1/2 h-[2px] w-[42%] -translate-y-1/2 scale-x-[-1]"
                            style={{
                                background: `linear-gradient(90deg, transparent 0, ${settingsForm.accentColor} 35%, ${settingsForm.primaryColor} 100%)`,
                            }}
                        />
                        <div
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 bg-[#fffdf7] ${expanded ? 'h-5 w-5' : 'h-3.5 w-3.5'}`}
                            style={{ borderColor: settingsForm.accentColor }}
                        />
                    </div>
                    <div
                        className={`grid gap-4 ${expanded ? 'mt-10' : 'mt-8'} ${isPortraitPreview ? '' : 'sm:grid-cols-2'}`}
                    >
                        <div>
                            <p
                                className={`font-semibold uppercase tracking-[0.14em] text-slate-500 ${expanded ? 'text-sm' : 'text-xs'}`}
                            >
                                {copy.issuedLabel}
                            </p>
                            <p
                                className={`font-semibold text-slate-900 ${expanded ? 'mt-3 text-2xl' : 'mt-2 text-sm'}`}
                            >
                                {previewDate}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            {settingsForm.signatureAssetUrl ? (
                                <img
                                    src={settingsForm.signatureAssetUrl}
                                    alt={copy.signatureAlt}
                                    className={`${expanded ? 'mb-3 ml-auto max-h-16 max-w-[220px]' : 'mb-2 ml-auto max-h-12 max-w-[180px]'} object-contain`}
                                />
                            ) : null}
                            <p
                                className={`font-semibold text-slate-900 ${expanded ? 'text-2xl' : 'text-sm'}`}
                            >
                                {previewIssuerName}
                            </p>
                            <div
                                className={`${expanded ? 'mt-3 h-[2px]' : 'mt-2 h-px'} w-full`}
                                style={{ backgroundColor: settingsForm.accentColor }}
                            />
                            <p
                                className={`mt-2 font-medium uppercase tracking-[0.14em] text-slate-500 ${expanded ? 'text-sm' : 'text-xs'}`}
                            >
                                {previewIssuerTitle}
                            </p>
                        </div>
                    </div>
                    <div
                        className={`flex items-center justify-center ${expanded ? 'mt-10' : 'mt-6'}`}
                    >
                        <div
                            className={`relative flex items-center justify-center rounded-full uppercase ${
                                expanded ? 'h-24 w-24' : 'h-16 w-16'
                            }`}
                            style={{
                                background: `radial-gradient(circle at 50% 45%, #fff4c8 0%, ${settingsForm.accentColor} 48%, #9f7220 100%)`,
                            }}
                        >
                            <PreviewTundukSeal
                                primaryColor={settingsForm.primaryColor}
                                accentColor={settingsForm.accentColor}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className={`flex items-center justify-between gap-3 ${
                        expanded ? 'mt-6 text-sm' : 'mt-4 text-xs'
                    } text-slate-600`}
                >
                    <span>{copy.verificationLabel}</span>
                    {/* l10n-audit-ignore: certificate number format example */}
                    <span className="font-semibold">{'EDB-XXXX-XXXX'}</span>
                </div>
            </div>
        </div>
    );
};

const CertificatesSection = ({
    mode = 'instructor',
    total,
    courses = [],
    loadingCourses,
    selectedCourseId,
    onSelectCourse,
    courseStudents,
    courseMeta,
    loadingStudents,
    error,
    refreshCourses,
    studentsPage,
    onChangePage,
    search,
    onSearchChange,
    progressMin,
    progressMax,
    onProgressMinChange,
    onProgressMaxChange,
    certificateSettings,
    courseCertificates = [],
    loadingCertificateWorkspace = false,
    savingCertificateSettings,
    onToggleCertificateApproval,
    onSaveCertificateSettings,
    onRegenerateCertificates,
    regeneratingCertificates,
    savingCertificateAssetKind,
    onSaveCertificateAsset,
    onCertificateAction,
    certificateActionStudentId,
    certificateActionKind,
    currentUser,
    disabledCourseCount = 0,
    disabledReason = '',
}) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isAdminMode = mode === 'admin';
    const defaultCertificateTitle = t('adminCertificates.previewCanvas.fallbackTitle', {
        lng: DEFAULT_CERTIFICATE_LANGUAGE,
    });
    const canIssueCertificates = isAdminMode;
    const canRevokeCertificates = isAdminMode;
    const canApproveCertificates =
        isAdminMode || certificateSettings?.approvalMode === 'instructor';
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [isTemplateEditMode, setIsTemplateEditMode] = useState(false);
    const [exactPreviewHtml, setExactPreviewHtml] = useState('');
    const [exactPreviewLoading, setExactPreviewLoading] = useState(false);
    const [exactPreviewError, setExactPreviewError] = useState('');
    const [downloadingCertificateKey, setDownloadingCertificateKey] = useState(null);
    const previewRequestIdRef = useRef(0);
    const previewFrameCleanupRef = useRef({});
    const [settingsForm, setSettingsForm] = useState({
        certificateTitle: defaultCertificateTitle,
        certificateLanguage: DEFAULT_CERTIFICATE_LANGUAGE,
        secondaryBrandName: '',
        secondaryBrandLogoUrl: '',
        issuerDisplayName: '',
        issuerTitle: '',
        signatureAssetUrl: '',
        pageOrientation: 'landscape',
        primaryColor: '#122144',
        accentColor: '#F17E22',
        eligibilityAttendanceRequired: true,
        eligibilityAttendancePercent: 80,
        eligibilityHomeworkRequired: false,
        eligibilityHomeworkPercent: 100,
        eligibilityActivitiesRequired: false,
        eligibilityActivitiesPercent: 100,
    });

    const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null;
    const defaultIssuerDisplayName =
        currentUser?.fullName ||
        selectedCourse?.instructorName ||
        '';
    const defaultIssuerTitle = isPlatformAdmin(currentUser)
        ? t('adminCertificates.previewCanvas.adminIssuerTitle')
        : t('adminCertificates.previewCanvas.instructorIssuerTitle');

    useEffect(() => {
        setSettingsForm({
            certificateTitle: certificateSettings?.certificateTitle || defaultCertificateTitle,
            certificateLanguage: certificateSettings?.certificateLanguage || DEFAULT_CERTIFICATE_LANGUAGE,
            secondaryBrandName: certificateSettings?.secondaryBrandName || '',
            secondaryBrandLogoUrl: certificateSettings?.secondaryBrandLogoUrl || '',
            issuerDisplayName: defaultIssuerDisplayName,
            issuerTitle: defaultIssuerTitle,
            signatureAssetUrl: certificateSettings?.signatureAssetUrl || '',
            pageOrientation: certificateSettings?.pageOrientation || 'landscape',
            primaryColor: certificateSettings?.primaryColor || '#122144',
            accentColor: certificateSettings?.accentColor || '#F17E22',
            eligibilityAttendanceRequired:
                certificateSettings?.eligibilityAttendanceRequired ?? true,
            eligibilityAttendancePercent:
                certificateSettings?.eligibilityAttendancePercent ?? 80,
            eligibilityHomeworkRequired:
                certificateSettings?.eligibilityHomeworkRequired ?? false,
            eligibilityHomeworkPercent:
                certificateSettings?.eligibilityHomeworkPercent ?? 100,
            eligibilityActivitiesRequired:
                certificateSettings?.eligibilityActivitiesRequired ?? false,
            eligibilityActivitiesPercent:
                certificateSettings?.eligibilityActivitiesPercent ?? 100,
        });
    }, [certificateSettings, defaultCertificateTitle, defaultIssuerDisplayName, defaultIssuerTitle]);

    useEffect(() => {
        setSelectedStudentId('');
        setIsTemplateEditMode(false);
    }, [selectedCourseId]);

    const handleSignatureAssetSave = useCallback(
        async (file) => {
            const updated = await onSaveCertificateAsset?.('signature', file);
            if (updated) {
                setSettingsForm((prev) => ({
                    ...prev,
                    signatureAssetUrl: updated.signatureAssetUrl || '',
                }));
            }
            return updated;
        },
        [onSaveCertificateAsset]
    );

    const sortedStudents = (courseStudents || []).slice().sort((a, b) => {
        const aDate = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
        const bDate = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
        return bDate - aDate;
    });
    const averageProgress = sortedStudents.length
        ? Math.round(
              sortedStudents.reduce(
                  (sum, student) =>
                      sum + Math.max(0, Math.min(100, Number(student.progressPercent || 0))),
                  0
              ) / sortedStudents.length
          )
        : 0;
    const completedCount = sortedStudents.filter((student) => student.completed).length;
    const certificateStats = courseCertificates.reduce(
        (acc, item) => {
            if (item?.status === 'issued') acc.issued += 1;
            else if (item?.status === 'pending_approval') acc.pending += 1;
            else if (item?.status === 'revoked') acc.revoked += 1;
            else if (item?.status === 'rejected') acc.rejected += 1;
            return acc;
        },
        { issued: 0, pending: 0, revoked: 0, rejected: 0 }
    );
    const previewStudentFallback =
        sortedStudents[0]?.fullName || t('adminCertificates.previewCanvas.sampleStudentName');
    const previewCourseTitle =
        courseMeta?.title || selectedCourse?.title || t('adminCertificates.previewCanvas.sampleCourseTitle');
    const previewIssuerName =
        settingsForm.issuerDisplayName.trim() ||
        selectedCourse?.instructorName ||
        t('adminCertificates.previewCanvas.sampleIssuerName');
    const previewIssuerTitle =
        settingsForm.issuerTitle.trim() || t('adminCertificates.previewCanvas.instructorIssuerTitle');
    const getCertificateDisplayPayload = useCallback(
        (student) => {
            return {
                studentFullName: student.fullName || undefined,
                issuerDisplayName: previewIssuerName || undefined,
                issuerTitle: previewIssuerTitle || undefined,
                certificateLanguage: settingsForm.certificateLanguage,
                pageOrientation: settingsForm.pageOrientation,
            };
        },
        [
            previewIssuerName,
            previewIssuerTitle,
            settingsForm.certificateLanguage,
            settingsForm.pageOrientation,
        ]
    );
    const previewDate = formatPreviewDate(new Date(), settingsForm.certificateLanguage);
    const isPortraitPreview = settingsForm.pageOrientation === 'portrait';
    const visibleStudents = selectedStudentId
        ? sortedStudents.filter((student) => String(student.id) === selectedStudentId)
        : sortedStudents;
    const previewStudentName = visibleStudents[0]?.fullName || previewStudentFallback;
    const templatePayload = getTemplatePayload(settingsForm, isAdminMode, defaultCertificateTitle);
    const savedTemplatePayload = getTemplatePayload(
        {
                certificateTitle: certificateSettings?.certificateTitle || defaultCertificateTitle,
                certificateLanguage: certificateSettings?.certificateLanguage || DEFAULT_CERTIFICATE_LANGUAGE,
                secondaryBrandName: certificateSettings?.secondaryBrandName || '',
                pageOrientation: certificateSettings?.pageOrientation || 'landscape',
                primaryColor: certificateSettings?.primaryColor || '#122144',
                accentColor: certificateSettings?.accentColor || '#F17E22',
                eligibilityAttendanceRequired:
                    certificateSettings?.eligibilityAttendanceRequired ?? true,
                eligibilityAttendancePercent:
                    certificateSettings?.eligibilityAttendancePercent ?? 80,
                eligibilityHomeworkRequired:
                    certificateSettings?.eligibilityHomeworkRequired ?? false,
                eligibilityHomeworkPercent:
                    certificateSettings?.eligibilityHomeworkPercent ?? 100,
                eligibilityActivitiesRequired:
                    certificateSettings?.eligibilityActivitiesRequired ?? false,
                eligibilityActivitiesPercent:
                    certificateSettings?.eligibilityActivitiesPercent ?? 100,
        },
        isAdminMode,
        defaultCertificateTitle
    );
    const hasTemplateChanges =
        JSON.stringify(templatePayload) !== JSON.stringify(savedTemplatePayload);
    const fieldEditDisabled = isAdminMode && !isTemplateEditMode;
    const shouldShowExactPreview = Boolean(exactPreviewHtml);
    const pageOrientationLabel = getPageOrientationLabel(settingsForm.pageOrientation, t);
    const colorPresets = [
        { label: 'EduBot', primary: '#122144', accent: '#F17E22' },
        { label: 'Forest', primary: '#1F4D3D', accent: '#D6A85F' },
        { label: 'Royal', primary: '#1E3A8A', accent: '#F59E0B' },
        { label: 'Graphite', primary: '#1F2937', accent: '#14B8A6' },
    ];

    const handlePreviewFrameLoad = useCallback((surface) => {
        return (event) => {
            previewFrameCleanupRef.current[surface]?.();
            previewFrameCleanupRef.current[surface] = fitExactPreviewFrame(event.currentTarget);
        };
    }, []);

    useEffect(() => {
        return () => {
            Object.values(previewFrameCleanupRef.current).forEach((cleanup) => cleanup?.());
            previewFrameCleanupRef.current = {};
        };
    }, []);

    const handleSaveTemplateSettings = useCallback(async () => {
        if (!isAdminMode) return false;
        const saved = await onSaveCertificateSettings(templatePayload);
        if (saved) setIsTemplateEditMode(false);
        return Boolean(saved);
    }, [isAdminMode, onSaveCertificateSettings, templatePayload]);

    const handleDownloadCertificate = useCallback(async (downloadUrl, filename, key) => {
        if (!downloadUrl) return;
        setDownloadingCertificateKey(key || downloadUrl);
        try {
            await downloadCourseCertificatePdf(downloadUrl, filename);
        } finally {
            setDownloadingCertificateKey(null);
        }
    }, []);

    const loadExactPreview = useCallback(async () => {
        if (!selectedCourseId) return;
        const requestId = ++previewRequestIdRef.current;
        setExactPreviewLoading(true);
        setExactPreviewError('');
        try {
            const html = await fetchCourseCertificatePreviewHtml(selectedCourseId, {
                certificateTitle: isAdminMode
                    ? settingsForm.certificateTitle.trim() || defaultCertificateTitle
                    : undefined,
                secondaryBrandName: isAdminMode
                    ? settingsForm.secondaryBrandName.trim() || null
                    : undefined,
                issuerDisplayName: settingsForm.issuerDisplayName.trim() || null,
                issuerTitle: settingsForm.issuerTitle.trim() || null,
                certificateLanguage: settingsForm.certificateLanguage,
                pageOrientation: settingsForm.pageOrientation,
                primaryColor: isAdminMode ? settingsForm.primaryColor : undefined,
                accentColor: isAdminMode ? settingsForm.accentColor : undefined,
                previewStudentName: previewStudentName,
                previewCourseTitle: previewCourseTitle,
                previewIssuerName: previewIssuerName,
                previewIssuerTitle: previewIssuerTitle,
                previewIssuedAt: new Date().toISOString(),
            });
            if (requestId !== previewRequestIdRef.current) return;
            setExactPreviewHtml(normalizeExactPreviewHtml(html || ''));
        } catch (err) {
            if (requestId !== previewRequestIdRef.current) return;
            console.error('Failed to load exact certificate preview', err);
            setExactPreviewError(t('adminCertificates.errors.exactPreviewLoad'));
        } finally {
            if (requestId === previewRequestIdRef.current) {
                setExactPreviewLoading(false);
            }
        }
    }, [
        isAdminMode,
        previewCourseTitle,
        previewIssuerName,
        previewIssuerTitle,
        previewStudentName,
        selectedCourseId,
        defaultCertificateTitle,
        settingsForm.accentColor,
        settingsForm.certificateTitle,
        settingsForm.certificateLanguage,
        settingsForm.issuerDisplayName,
        settingsForm.issuerTitle,
        settingsForm.pageOrientation,
        settingsForm.primaryColor,
        settingsForm.secondaryBrandName,
        t,
    ]);

    useEffect(() => {
        if (!selectedCourseId) return;
        const timeoutId = window.setTimeout(() => {
            loadExactPreview();
        }, 250);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadExactPreview, selectedCourseId]);

    return (
        <div className="space-y-5">
            <div className="dashboard-panel overflow-hidden">
                <DashboardSectionHeader
                    eyebrow={t('adminCertificates.page.hero.eyebrow')}
                    title={t('adminCertificates.page.hero.title')}
                    description={
                        isAdminMode
                            ? t('adminCertificates.page.hero.adminDescription')
                            : t('adminCertificates.page.hero.instructorDescription')
                    }
                    action={
                        <button
                            type="button"
                            onClick={refreshCourses}
                            disabled={loadingCourses}
                            className="dashboard-button-secondary"
                        >
                            {t('adminCertificates.page.actions.refresh')}
                        </button>
                    }
                />

                <div className="grid gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
                    <DashboardMetricCard
                        label={t('adminCertificates.page.metrics.totalStudents')}
                        value={total ?? '—'}
                        icon={FiUsers}
                    />
                    <DashboardMetricCard
                        label={t('adminCertificates.page.metrics.courses')}
                        value={courses.length}
                        icon={FiBookOpen}
                        tone="blue"
                    />
                    <DashboardMetricCard
                        label={t('adminCertificates.page.metrics.courseCertificates')}
                        value={selectedCourseId ? courseCertificates.length : '—'}
                        icon={FiAward}
                        tone="green"
                    />
                    <DashboardMetricCard
                        label={t('adminCertificates.page.metrics.averageProgress')}
                        value={selectedCourseId ? `${averageProgress}%` : '—'}
                        icon={FiActivity}
                        tone="amber"
                    />
                </div>
            </div>

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                </div>
            ) : null}

            {disabledCourseCount > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    {disabledReason || 'Certificates are disabled for some tenant courses.'}
                </div>
            ) : null}

            <DashboardInsetPanel
                title={t('adminCertificates.page.selection.title')}
                description={t('adminCertificates.page.selection.description')}
            >
                {loadingCourses && !courses.length ? (
                    <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-slate-50 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                        {t('adminCertificates.page.selection.loadingCourses')}
                    </div>
                ) : courses.length ? (
                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(220px,1fr)]">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                {t('adminCertificates.page.selection.courseLabel')}
                            </label>
                            <select
                                value={selectedCourseId ?? ''}
                                onChange={(e) =>
                                    onSelectCourse(e.target.value ? Number(e.target.value) : null)
                                }
                                className="dashboard-field"
                            >
                                <option value="">{t('adminCertificates.page.selection.selectCourse')}</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                {t('adminCertificates.page.selection.studentLabel')}
                            </label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                disabled={!selectedCourseId || !sortedStudents.length}
                                className="dashboard-field"
                            >
                                <option value="">{t('adminCertificates.page.selection.allStudents')}</option>
                                {sortedStudents.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                {t('adminCertificates.page.selection.visibilityLabel')}
                            </label>
                            <div className="flex h-11 items-center rounded-2xl border border-edubot-line/70 bg-slate-50 px-4 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                                {selectedCourseId
                                    ? selectedStudentId
                                        ? t('adminCertificates.page.selection.specificStudentSelected')
                                        : t('adminCertificates.page.selection.studentsVisible', {
                                            count: visibleStudents.length,
                                        })
                                    : t('adminCertificates.page.selection.noCourseSelected')}
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        title={t('adminCertificates.page.selection.noCoursesTitle')}
                        subtitle={t('adminCertificates.page.selection.noCoursesSubtitle')}
                        action={{
                            label: t('adminCertificates.page.actions.createCourse'),
                            onClick: () => navigate('/instructor/course/create'),
                        }}
                        className="py-8"
                    />
                )}
            </DashboardInsetPanel>

            {!selectedCourseId ? (
                <DashboardInsetPanel
                    title={t('adminCertificates.page.selection.noCoursePanelTitle')}
                    description={t('adminCertificates.page.selection.noCoursePanelDescription')}
                >
                    <div className="mt-4 rounded-2xl border border-dashed border-edubot-line/80 bg-slate-50 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                        {t('adminCertificates.page.selection.noCoursePanelBody')}
                    </div>
                </DashboardInsetPanel>
            ) : (
                <>
                    <DashboardInsetPanel
                        title={courseMeta?.title || selectedCourse?.title || t('adminCertificates.page.courseWorkspace.fallbackTitle')}
                        description={t('adminCertificates.page.courseWorkspace.description')}
                        action={
                            <button
                                type="button"
                                onClick={() => onSelectCourse(null)}
                                className="dashboard-button-secondary"
                            >
                                {t('adminCertificates.page.actions.backToCourses')}
                            </button>
                        }
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <DashboardMetricCard
                                label={t('adminCertificates.page.metrics.courseStudents')}
                                value={courseMeta?.studentCount ?? sortedStudents.length}
                                icon={FiUsers}
                            />
                            <DashboardMetricCard
                                label={t('adminCertificates.page.metrics.lessons')}
                                value={courseMeta?.lessonCount ?? '—'}
                                icon={FiBookOpen}
                                tone="blue"
                            />
                            <DashboardMetricCard
                                label={t('adminCertificates.page.metrics.completed')}
                                value={completedCount}
                                icon={FiCalendar}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label={t('adminCertificates.page.metrics.registryCertificates')}
                                value={courseCertificates.length}
                                icon={FiAward}
                                tone="amber"
                            />
                        </div>
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('adminCertificates.page.filters.title')}
                        description={t('adminCertificates.page.filters.description')}
                    >
                        <div className="mt-4 flex flex-wrap items-end gap-3">
                            <div className="min-w-[220px] flex-1">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('adminCertificates.page.filters.studentSearch')}
                                </label>
                                <div className="relative">
                                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-edubot-muted dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            onChangePage(1);
                                            onSearchChange(e.target.value);
                                        }}
                                        placeholder={t('adminCertificates.page.filters.searchPlaceholder')}
                                        className="dashboard-field dashboard-field-icon pl-10"
                                    />
                                </div>
                            </div>
                            <div className="min-w-[220px] flex-1">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('adminCertificates.page.filters.studentSelector')}
                                </label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="dashboard-field"
                                >
                                    <option value="">{t('adminCertificates.page.selection.allStudents')}</option>
                                    {sortedStudents.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('adminCertificates.page.filters.progressMin')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progressMin}
                                    onChange={(e) => {
                                        onChangePage(1);
                                        onProgressMinChange(e.target.value);
                                    }}
                                    className="dashboard-field w-28"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                    {t('adminCertificates.page.filters.progressMax')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progressMax}
                                    onChange={(e) => {
                                        onChangePage(1);
                                        onProgressMaxChange(e.target.value);
                                    }}
                                    className="dashboard-field w-28"
                                />
                            </div>
                        </div>
                    </DashboardInsetPanel>

                    {isAdminMode ? (
                        <DashboardInsetPanel
                            title={t('adminCertificates.page.rule.title')}
                            description={t('adminCertificates.page.rule.description')}
                        >
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="text-sm text-edubot-muted dark:text-slate-400">
                                    {t('adminCertificates.page.rule.current')}
                                    <span className="ml-2 font-semibold text-edubot-ink dark:text-white">
                                        {certificateSettings?.approvalMode === 'instructor'
                                            ? t('adminCertificates.page.rule.approvalModeInstructor')
                                            : t('adminCertificates.page.rule.approvalModeAutomatic')}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onToggleCertificateApproval(
                                            certificateSettings?.approvalMode !== 'instructor'
                                        )
                                    }
                                    disabled={savingCertificateSettings}
                                    className="dashboard-button-secondary"
                                >
                                    <FiAward className="h-4 w-4" />
                                    {certificateSettings?.approvalMode === 'instructor'
                                        ? t('adminCertificates.page.rule.switchToAutomatic')
                                        : t('adminCertificates.page.rule.switchToInstructorApproval')}
                                </button>
                            </div>
                        </DashboardInsetPanel>
                    ) : null}

                    {isAdminMode ? (
                        <DashboardInsetPanel
                            title={t('adminCertificates.page.requirements.title')}
                            description={t('adminCertificates.page.requirements.description')}
                        >
                            <div className="mt-4 grid gap-3 lg:grid-cols-3">
                                {[
                                    {
                                        key: 'Attendance',
                                        icon: FiUsers,
                                        title: t('adminCertificates.page.requirements.attendance.title'),
                                        description: t('adminCertificates.page.requirements.attendance.description'),
                                        enabledKey: 'eligibilityAttendanceRequired',
                                        percentKey: 'eligibilityAttendancePercent',
                                    },
                                    {
                                        key: 'Homework',
                                        icon: FiBookOpen,
                                        title: t('adminCertificates.page.requirements.homework.title'),
                                        description: t('adminCertificates.page.requirements.homework.description'),
                                        enabledKey: 'eligibilityHomeworkRequired',
                                        percentKey: 'eligibilityHomeworkPercent',
                                    },
                                    {
                                        key: 'Activities',
                                        icon: FiActivity,
                                        title: t('adminCertificates.page.requirements.activities.title'),
                                        description: t('adminCertificates.page.requirements.activities.description'),
                                        enabledKey: 'eligibilityActivitiesRequired',
                                        percentKey: 'eligibilityActivitiesPercent',
                                    },
                                ].map((rule) => {
                                    const Icon = rule.icon;
                                    return (
                                        <div
                                            key={rule.key}
                                            className="dashboard-panel rounded-2xl border border-edubot-line/70 p-4 dark:border-slate-700"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-edubot-orange/10 text-edubot-orange">
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        <span>{rule.title}</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(settingsForm[rule.enabledKey])}
                                                            onChange={(e) =>
                                                                setSettingsForm((prev) => ({
                                                                    ...prev,
                                                                    [rule.enabledKey]: e.target.checked,
                                                                }))
                                                            }
                                                            className="h-4 w-4 rounded border-edubot-line text-edubot-orange focus:ring-edubot-orange"
                                                        />
                                                    </label>
                                                    <p className="mt-2 text-xs leading-5 text-edubot-muted dark:text-slate-400">
                                                        {rule.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                    {t('adminCertificates.page.requirements.minimumPercent')}
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={settingsForm[rule.percentKey]}
                                                    onChange={(e) =>
                                                        setSettingsForm((prev) => ({
                                                            ...prev,
                                                            [rule.percentKey]: e.target.value,
                                                        }))
                                                    }
                                                    className="dashboard-field w-28"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveTemplateSettings}
                                    disabled={savingCertificateSettings || !hasTemplateChanges}
                                    className="dashboard-button-primary"
                                >
                                    {t('adminCertificates.page.actions.saveRequirements')}
                                </button>
                            </div>
                        </DashboardInsetPanel>
                    ) : null}

                    <DashboardInsetPanel
                        title={t('adminCertificates.page.template.title')}
                        description={
                            isAdminMode
                                ? t('adminCertificates.page.template.adminDescription')
                                : t('adminCertificates.page.template.instructorDescription')
                        }
                    >
                        {isAdminMode ? (
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-edubot-line/70 bg-white/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/35">
                                <div>
                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                        {isTemplateEditMode
                                            ? t('adminCertificates.page.template.editMode')
                                            : t('adminCertificates.page.template.viewMode')}
                                    </p>
                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                        {isTemplateEditMode
                                            ? t('adminCertificates.page.template.editModeDescription')
                                            : t('adminCertificates.page.template.viewModeDescription')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {isTemplateEditMode ? (
                                        <button
                                            type="button"
                                            onClick={handleSaveTemplateSettings}
                                            disabled={
                                                savingCertificateSettings || !hasTemplateChanges
                                            }
                                            className="dashboard-button-primary"
                                        >
                                            <FiAward className="h-4 w-4" />
                                            {savingCertificateSettings
                                                ? t('adminCertificates.page.template.saving')
                                                : t('adminCertificates.page.template.saveRules')}
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => setIsTemplateEditMode((value) => !value)}
                                        className="dashboard-button-secondary"
                                    >
                                        {isTemplateEditMode
                                            ? t('adminCertificates.page.template.viewMode')
                                            : t('adminCertificates.page.template.editMode')}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)]">
                            <div className={isAdminMode ? 'space-y-4 xl:contents' : 'hidden'}>
                                {isAdminMode ? (
                                    <section className="rounded-[24px] border border-edubot-line/70 bg-white/55 p-5 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-950/35">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                    {t('adminCertificates.page.template.branding.title')}
                                                </p>
                                                <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                    {t('adminCertificates.page.template.branding.description')}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-edubot-orange/10 px-3 py-1 text-xs font-semibold text-edubot-orange">
                                                {t('adminCertificates.page.template.branding.primaryBrandBadge')}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid gap-4">
                                            <div className="lg:col-span-2">
                                                {isTemplateEditMode ? (
                                                    <>
                                                        <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                            {t('adminCertificates.page.template.branding.certificateTitle')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={settingsForm.certificateTitle}
                                                            onChange={(e) =>
                                                                setSettingsForm((prev) => ({
                                                                    ...prev,
                                                                    certificateTitle:
                                                                        e.target.value,
                                                                }))
                                                            }
                                                            className="dashboard-field"
                                                        />
                                                    </>
                                                ) : (
                                                    <ReadOnlyField
                                                        label={t('adminCertificates.page.template.branding.certificateTitle')}
                                                        value={
                                                            settingsForm.certificateTitle ||
                                                            'Certificate of Achievement'
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                {isTemplateEditMode ? (
                                                    <>
                                                        <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                            {t('adminCertificates.page.template.branding.secondaryBrand')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={settingsForm.secondaryBrandName}
                                                            onChange={(e) =>
                                                                setSettingsForm((prev) => ({
                                                                    ...prev,
                                                                    secondaryBrandName:
                                                                        e.target.value,
                                                                }))
                                                            }
                                                            placeholder={t('adminCertificates.page.template.branding.secondaryBrandPlaceholder')}
                                                            className="dashboard-field"
                                                        />
                                                    </>
                                                ) : (
                                                    <ReadOnlyField
                                                        label={t('adminCertificates.page.template.branding.secondaryBrand')}
                                                        value={
                                                            settingsForm.secondaryBrandName ||
                                                            t('adminCertificates.page.template.notProvided')
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div className="rounded-2xl border border-edubot-line/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                            {t('adminCertificates.page.template.branding.secondaryLogo')}
                                                        </p>
                                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                            {t('adminCertificates.page.template.branding.logoFormats')}
                                                        </p>
                                                    </div>
                                                    {isTemplateEditMode ? (
                                                        <label className="dashboard-button-secondary cursor-pointer">
                                                            {settingsForm.secondaryBrandLogoUrl
                                                                ? t('adminCertificates.page.template.replace')
                                                                : t('adminCertificates.page.template.upload')}
                                                            <input
                                                                type="file"
                                                                accept="image/png,image/jpeg,image/webp"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    const file =
                                                                        e.target.files?.[0];
                                                                    if (!file) return;
                                                                    const updated =
                                                                        await onSaveCertificateAsset?.(
                                                                            'secondary-logo',
                                                                            file
                                                                        );
                                                                    if (updated) {
                                                                        setSettingsForm((prev) => ({
                                                                            ...prev,
                                                                            secondaryBrandLogoUrl:
                                                                                updated.secondaryBrandLogoUrl ||
                                                                                '',
                                                                        }));
                                                                    }
                                                                    e.target.value = '';
                                                                }}
                                                            />
                                                        </label>
                                                    ) : null}
                                                </div>
                                                <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-950/70">
                                                    {settingsForm.secondaryBrandLogoUrl ? (
                                                        <img
                                                            src={settingsForm.secondaryBrandLogoUrl}
                                                            alt={t('adminCertificates.page.template.branding.secondaryLogoAlt')}
                                                            className="max-h-14 max-w-full object-contain"
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-edubot-muted dark:text-slate-400">
                                                            {t('adminCertificates.page.template.branding.logoEmpty')}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                                    {savingCertificateAssetKind === 'secondary-logo'
                                                        ? t('adminCertificates.page.template.branding.logoUploading')
                                                        : settingsForm.secondaryBrandLogoUrl
                                                          ? t('adminCertificates.page.template.branding.logoReady')
                                                          : t('adminCertificates.page.template.branding.logoOptional')}
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                ) : null}

                                <div
                                    className={`grid gap-4 ${isAdminMode ? 'xl:col-span-2 xl:row-start-2 xl:grid-cols-2' : 'hidden'}`}
                                >
                                    <section className="rounded-[24px] border border-edubot-line/70 bg-white/55 p-5 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-950/35">
                                        <div>
                                            <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                {t('adminCertificates.page.template.signer.title')}
                                            </p>
                                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                {t('adminCertificates.page.template.signer.description')}
                                            </p>
                                        </div>
                                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                    {t('adminCertificates.page.template.signer.certificateLanguage')}
                                                </label>
                                                <select
                                                    value={settingsForm.certificateLanguage}
                                                    onChange={(e) =>
                                                        setSettingsForm((prev) => ({
                                                            ...prev,
                                                            certificateLanguage: e.target.value,
                                                        }))
                                                    }
                                                    className="dashboard-field"
                                                >
                                                    {CERTIFICATE_LANGUAGE_OPTIONS.map((option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {t(option.labelKey)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                    {t('adminCertificates.page.template.signer.signerName')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.issuerDisplayName}
                                                    onChange={(e) =>
                                                        setSettingsForm((prev) => ({
                                                            ...prev,
                                                            issuerDisplayName: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={
                                                        selectedCourse?.instructorName ||
                                                        t('adminCertificates.page.template.signer.signerNamePlaceholder')
                                                    }
                                                    className="dashboard-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                    {t('adminCertificates.page.template.signer.signerRole')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.issuerTitle}
                                                    onChange={(e) =>
                                                        setSettingsForm((prev) => ({
                                                            ...prev,
                                                            issuerTitle: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={t('adminCertificates.page.template.signer.signerRolePlaceholder')}
                                                    className="dashboard-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                    {t('adminCertificates.page.template.signer.certificateFormat')}
                                                </label>
                                                <select
                                                    value={settingsForm.pageOrientation}
                                                    onChange={(e) =>
                                                        setSettingsForm((prev) => ({
                                                            ...prev,
                                                            pageOrientation: e.target.value,
                                                        }))
                                                    }
                                                    className="dashboard-field"
                                                >
                                                    <option value="landscape">
                                                        {t('common.enums.pageOrientations.landscape')}
                                                    </option>
                                                    <option value="portrait">
                                                        {t('common.enums.pageOrientations.portrait')}
                                                    </option>
                                                </select>
                                            </div>
                                            <div className="rounded-2xl border border-edubot-line/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                            {t('adminCertificates.page.template.signer.signature')}
                                                        </p>
                                                        <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                            {t('adminCertificates.page.template.signer.signatureDescription')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsSignatureModalOpen(true)}
                                                        disabled={
                                                            savingCertificateAssetKind ===
                                                            'signature'
                                                        }
                                                        className="dashboard-button-secondary"
                                                    >
                                                        {settingsForm.signatureAssetUrl
                                                            ? t('adminCertificates.page.template.signer.updateSignature')
                                                            : t('adminCertificates.page.template.signer.drawSignature')}
                                                    </button>
                                                </div>
                                                <div className="mt-4 rounded-2xl border border-[#d8c28f] bg-[#fffaf0] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-[#8f7a4b] dark:bg-[#fff8ea]">
                                                    {settingsForm.signatureAssetUrl ? (
                                                        <img
                                                            src={settingsForm.signatureAssetUrl}
                                                            alt={t('adminCertificates.page.template.signer.signatureAlt')}
                                                            className="max-h-16 max-w-full object-contain opacity-95"
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-[#7a6850] dark:text-[#7a6850]">
                                                            {t('adminCertificates.page.template.signer.signatureEmpty')}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-edubot-muted dark:text-slate-400">
                                                    {savingCertificateAssetKind === 'signature'
                                                        ? t('adminCertificates.page.template.signer.signatureSaving')
                                                        : settingsForm.signatureAssetUrl
                                                          ? t('adminCertificates.page.template.signer.signatureReady')
                                                          : t('adminCertificates.page.template.signer.signatureHelp')}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {isAdminMode ? (
                                        <section className="rounded-[24px] border border-edubot-line/70 bg-white/55 p-5 shadow-edubot-soft dark:border-slate-700 dark:bg-slate-950/35">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {t('adminCertificates.page.template.appearance.title')}
                                                    </p>
                                                    <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                                        {t('adminCertificates.page.template.appearance.description')}
                                                    </p>
                                                </div>
                                                {isTemplateEditMode ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSettingsForm((prev) => ({
                                                                ...prev,
                                                                pageOrientation: 'landscape',
                                                                primaryColor: '#122144',
                                                                accentColor: '#F17E22',
                                                            }))
                                                        }
                                                        className="dashboard-button-secondary"
                                                    >
                                                        {t('adminCertificates.page.template.appearance.resetDefaults')}
                                                    </button>
                                                ) : null}
                                            </div>
                                            <div className="mt-4 rounded-2xl border border-edubot-line/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/55">
                                                <div className="space-y-4">
                                                    <div className="max-w-sm">
                                                        {isTemplateEditMode ? (
                                                            <>
                                                                <label className="mb-2 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                                    {t('adminCertificates.page.template.appearance.pageOrientation')}
                                                                </label>
                                                                <select
                                                                    value={
                                                                        settingsForm.pageOrientation
                                                                    }
                                                                    onChange={(e) =>
                                                                        setSettingsForm(
                                                                            (prev) => ({
                                                                                ...prev,
                                                                                pageOrientation:
                                                                                    e.target
                                                                                        .value,
                                                                            })
                                                                        )
                                                                    }
                                                                    className="dashboard-select"
                                                                >
                                                                    <option value="landscape">
                                                                        {t('common.enums.pageOrientations.landscape')}
                                                                    </option>
                                                                    <option value="portrait">
                                                                        {t('common.enums.pageOrientations.portrait')}
                                                                    </option>
                                                                </select>
                                                            </>
                                                        ) : (
                                                            <ReadOnlyField
                                                                label={t('adminCertificates.page.template.appearance.pageOrientation')}
                                                                value={pageOrientationLabel}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="grid gap-4">
                                                        <div className="rounded-2xl border border-edubot-line/70 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                                                            <label className="mb-3 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                                {t('adminCertificates.page.template.appearance.primaryColor')}
                                                            </label>
                                                            <div className="space-y-3">
                                                                <div
                                                                    className="h-16 rounded-2xl border border-edubot-line/70 shadow-inner dark:border-slate-700"
                                                                    style={{
                                                                        backgroundColor:
                                                                            settingsForm.primaryColor,
                                                                    }}
                                                                />
                                                                <div className="flex items-center gap-3">
                                                                    {isTemplateEditMode ? (
                                                                        <input
                                                                            type="color"
                                                                            value={
                                                                                settingsForm.primaryColor
                                                                            }
                                                                            onChange={(e) =>
                                                                                setSettingsForm(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        primaryColor:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    })
                                                                                )
                                                                            }
                                                                            className="h-14 w-14 shrink-0 rounded-2xl border border-edubot-line bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900"
                                                                        />
                                                                    ) : null}
                                                                    <div className="min-w-0 flex-1 rounded-2xl border border-edubot-line bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                                            Hex
                                                                        </p>
                                                                        <p className="mt-1 truncate text-sm font-semibold uppercase tracking-[0.06em] text-edubot-ink dark:text-white">
                                                                            {
                                                                                settingsForm.primaryColor
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-2xl border border-edubot-line/70 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-950/70">
                                                            <label className="mb-3 block text-sm font-medium text-edubot-ink dark:text-slate-200">
                                                                {t('adminCertificates.page.template.appearance.accentColor')}
                                                            </label>
                                                            <div className="space-y-3">
                                                                <div
                                                                    className="h-16 rounded-2xl border border-edubot-line/70 shadow-inner dark:border-slate-700"
                                                                    style={{
                                                                        backgroundColor:
                                                                            settingsForm.accentColor,
                                                                    }}
                                                                />
                                                                <div className="flex items-center gap-3">
                                                                    {isTemplateEditMode ? (
                                                                        <input
                                                                            type="color"
                                                                            value={
                                                                                settingsForm.accentColor
                                                                            }
                                                                            onChange={(e) =>
                                                                                setSettingsForm(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        accentColor:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    })
                                                                                )
                                                                            }
                                                                            className="h-14 w-14 shrink-0 rounded-2xl border border-edubot-line bg-white p-1.5 dark:border-slate-700 dark:bg-slate-900"
                                                                        />
                                                                    ) : null}
                                                                    <div className="min-w-0 flex-1 rounded-2xl border border-edubot-line bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                                            Hex
                                                                        </p>
                                                                        <p className="mt-1 truncate text-sm font-semibold uppercase tracking-[0.06em] text-edubot-ink dark:text-white">
                                                                            {
                                                                                settingsForm.accentColor
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isTemplateEditMode ? (
                                                    <div className="mt-4 border-t border-edubot-line/70 pt-4 dark:border-slate-700">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-edubot-muted dark:text-slate-400">
                                                                {t('adminCertificates.page.template.appearance.presets')}
                                                            </p>
                                                            <p className="text-sm text-edubot-muted dark:text-slate-400">
                                                                {t('adminCertificates.page.template.appearance.presetsDescription')}
                                                            </p>
                                                        </div>
                                                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                            {colorPresets.map((preset) => (
                                                                <button
                                                                    key={preset.label}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSettingsForm((prev) => ({
                                                                            ...prev,
                                                                            primaryColor:
                                                                                preset.primary,
                                                                            accentColor:
                                                                                preset.accent,
                                                                        }))
                                                                    }
                                                                    className="group rounded-2xl border border-edubot-line/70 bg-white/90 px-3 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-edubot-orange hover:shadow-edubot-soft dark:border-slate-700 dark:bg-slate-950/70"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="h-5 w-1.5 rounded-full border border-white/20"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    preset.primary,
                                                                            }}
                                                                        />
                                                                        <span
                                                                            className="h-5 w-1.5 rounded-full border border-white/20"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    preset.accent,
                                                                            }}
                                                                        />
                                                                        <span className="ml-1 text-sm font-semibold text-edubot-ink dark:text-white">
                                                                            {preset.label}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </section>
                                    ) : null}
                                </div>
                            </div>

                            <aside
                                className={`rounded-[30px] border border-edubot-line/70 bg-slate-950 p-5 shadow-edubot-hover dark:border-slate-700 xl:sticky xl:top-6 xl:self-start ${isAdminMode ? 'xl:col-start-2 xl:row-start-1' : 'xl:col-span-2'}`}
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-semibold text-slate-200">
                                            {t('adminCertificates.page.template.preview.livePreview')}
                                        </span>
                                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-300">
                                            {pageOrientationLabel}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => loadExactPreview()}
                                            disabled={exactPreviewLoading || !selectedCourseId}
                                            className="dashboard-button-secondary !border-slate-600 !bg-slate-900 !text-slate-100"
                                        >
                                            {t('adminCertificates.page.actions.refresh')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPreviewModalOpen(true)}
                                            className="dashboard-button-secondary !border-slate-600 !bg-slate-900 !text-slate-100"
                                        >
                                            {t('adminCertificates.page.template.preview.fullPreview')}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-5 rounded-[28px] border border-slate-700 bg-white/95 p-3 shadow-[0_24px_56px_rgba(15,23,42,0.28)]">
                                    {exactPreviewLoading ? (
                                        <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-edubot-line/70 bg-white text-slate-500">
                                            {t('adminCertificates.page.template.preview.exactLoading')}
                                        </div>
                                    ) : exactPreviewError ? (
                                        <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-red-500/30 bg-red-500/10 px-6 text-center text-red-300">
                                            {exactPreviewError}
                                        </div>
                                    ) : shouldShowExactPreview ? (
                                        <iframe
                                            title={t('adminCertificates.page.template.preview.exactFrameTitle')}
                                            srcDoc={exactPreviewHtml}
                                            scrolling="no"
                                            onLoad={handlePreviewFrameLoad('inline')}
                                            className={`w-full overflow-hidden rounded-[24px] border border-edubot-line/70 bg-white ${
                                                isPortraitPreview
                                                    ? 'h-[min(640px,80vw)] min-h-[360px]'
                                                    : 'h-[min(440px,56vw)] min-h-[260px]'
                                            }`}
                                        />
                                    ) : (
                                        <CertificatePreviewCanvas
                                            settingsForm={settingsForm}
                                            isPortraitPreview={isPortraitPreview}
                                            previewStudentName={previewStudentName}
                                            previewCourseTitle={previewCourseTitle}
                                            previewIssuerName={previewIssuerName}
                                            previewIssuerTitle={previewIssuerTitle}
                                            previewDate={previewDate}
                                            compact
                                        />
                                    )}
                                </div>
                                {isAdminMode ? (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-800 bg-slate-900/65 px-4 py-3">
                                        <div className="text-sm text-slate-300">
                                            <span>
                                                {hasTemplateChanges
                                                    ? t('adminCertificates.page.template.preview.unsavedChanges')
                                                    : t('adminCertificates.page.template.preview.templateSaved')}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </aside>
                        </div>

                        {isAdminMode ? (
                        <div className="mt-6 rounded-[24px] border border-edubot-line/70 bg-slate-50/85 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/70">
                            <div className="flex flex-wrap items-start justify-between gap-5">
                                <div className="space-y-1">
                                    <div className="text-sm text-edubot-muted dark:text-slate-400">
                                        <span className="font-semibold text-edubot-ink dark:text-white">
                                            {t('adminCertificates.page.template.footer.primaryBrand')}
                                        </span>{' '}
                                        EduBot Learning
                                        {settingsForm.secondaryBrandName
                                            ? t('adminCertificates.page.template.footer.secondaryBrandSummary', {
                                                brand: settingsForm.secondaryBrandName,
                                            })
                                            : ''}
                                    </div>
                                    <div
                                        className={`text-xs font-medium ${
                                            hasTemplateChanges
                                                ? 'text-amber-600 dark:text-amber-300'
                                                : 'text-emerald-600 dark:text-emerald-300'
                                        }`}
                                    >
                                        {hasTemplateChanges
                                            ? t('adminCertificates.page.template.footer.unsavedChanges')
                                            : t('adminCertificates.page.template.footer.allChangesSaved')}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-start gap-4">
                                    {isAdminMode ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onRegenerateCertificates()}
                                                disabled={regeneratingCertificates}
                                                className="dashboard-button-secondary !border-amber-300/60 !bg-amber-50 !text-amber-800 hover:!border-amber-400 hover:!text-amber-900 dark:!border-amber-500/30 dark:!bg-amber-500/10 dark:!text-amber-200"
                                            >
                                                <FiClock className="h-4 w-4" />
                                                {regeneratingCertificates
                                                    ? t('adminCertificates.page.template.footer.regenerating')
                                                    : t('adminCertificates.page.template.footer.regeneratePdf')}
                                            </button>
                                            <p className="text-[11px] text-edubot-muted dark:text-slate-400">
                                                {t('adminCertificates.page.template.footer.regenerateHelp')}
                                            </p>
                                        </div>
                                    ) : null}
                                    {isAdminMode ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <button
                                                type="button"
                                                onClick={handleSaveTemplateSettings}
                                                disabled={
                                                    fieldEditDisabled ||
                                                    savingCertificateSettings ||
                                                    !hasTemplateChanges
                                                }
                                                className="dashboard-button-primary"
                                            >
                                                <FiAward className="h-4 w-4" />
                                                {savingCertificateSettings
                                                    ? t('adminCertificates.page.template.saving')
                                                    : t('adminCertificates.page.template.footer.saveTemplate')}
                                            </button>
                                            <p className="text-[11px] text-edubot-muted dark:text-slate-400">
                                                {t('adminCertificates.page.template.footer.saveTemplateHelp')}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="mt-4 grid gap-2 border-t border-edubot-line/70 pt-3 text-[11px] leading-5 text-edubot-muted dark:border-slate-700 dark:text-slate-400 md:grid-cols-2">
                                <p>
                                    {t('adminCertificates.page.template.footer.regenerateNote')}
                                </p>
                                <p className="md:text-right">
                                    {t('adminCertificates.page.template.footer.saveTemplateNote')}
                                </p>
                            </div>
                        </div>
                        ) : null}
                    </DashboardInsetPanel>

                    <DashboardInsetPanel
                        title={t('adminCertificates.page.registry.title')}
                        description={t('adminCertificates.page.registry.description')}
                    >
                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <DashboardMetricCard
                                label={t('adminCertificates.page.registry.metrics.issued')}
                                value={certificateStats.issued}
                                icon={FiAward}
                                tone="green"
                            />
                            <DashboardMetricCard
                                label={t('adminCertificates.page.registry.metrics.pending')}
                                value={certificateStats.pending}
                                icon={FiClock}
                                tone="amber"
                            />
                            <DashboardMetricCard
                                label={t('adminCertificates.page.registry.metrics.revoked')}
                                value={certificateStats.revoked}
                                icon={FiCalendar}
                            />
                            <DashboardMetricCard
                                label={t('adminCertificates.page.registry.metrics.rejected')}
                                value={certificateStats.rejected}
                                icon={FiChevronRight}
                            />
                        </div>
                        {loadingCertificateWorkspace ? (
                            <div className="mt-5">
                                <DashboardTableSkeleton rows={4} columns={3} />
                            </div>
                        ) : courseCertificates.length ? (
                            <div className="mt-5 space-y-3">
                                {courseCertificates.slice(0, 8).map((item) => {
                                    const downloadKey = `registry-${item.publicId || item.id}`;
                                    const isDownloading = downloadingCertificateKey === downloadKey;
                                    return (
                                        <div
                                            key={item.id || item.publicId}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edubot-line/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-edubot-ink dark:text-white">
                                                    {item.studentName ||
                                                        t('adminCertificates.page.registry.studentFallback', {
                                                            id: item.studentId,
                                                        })}
                                                </p>
                                                <p className="mt-1 text-xs text-edubot-muted dark:text-slate-400">
                                                    {item.publicId} ·{' '}
                                                    {getStudentCertificateStatusLabel(item.status, t)}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {item.downloadUrl ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDownloadCertificate(
                                                                item.downloadUrl,
                                                                `certificate-${item.publicId}.pdf`,
                                                                downloadKey
                                                            )
                                                        }
                                                        disabled={isDownloading}
                                                        className="dashboard-button-secondary"
                                                    >
                                                        {isDownloading
                                                            ? t('common.loadingEllipsis')
                                                            : t('adminCertificates.actions.pdf')}
                                                    </button>
                                                ) : null}
                                                {item.verificationUrl ? (
                                                    <a
                                                        href={item.verificationUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="dashboard-button-secondary"
                                                    >
                                                        {t('adminCertificates.actions.verify')}
                                                    </a>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-edubot-line/70 bg-slate-50 px-4 py-6 text-sm text-edubot-muted dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
                                {t('adminCertificates.page.registry.empty')}
                            </div>
                        )}
                    </DashboardInsetPanel>

                    {loadingStudents ? (
                        <DashboardInsetPanel
                            title={t('adminCertificates.page.students.title')}
                            description={t('adminCertificates.page.students.loadingDescription')}
                        >
                            <div className="mt-4">
                                <DashboardTableSkeleton rows={5} columns={5} />
                            </div>
                        </DashboardInsetPanel>
                    ) : visibleStudents.length ? (
                        <DashboardInsetPanel
                            title={t('adminCertificates.page.students.issueTitle')}
                            description={t('adminCertificates.page.students.issueDescription')}
                        >
                            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                {visibleStudents.map((student) => {
                                    const issueState = getStudentCertificateState(
                                        student,
                                        canIssueCertificates,
                                        t
                                    );
                                    const downloadKey = `student-${
                                        student.certificatePublicId || student.id
                                    }`;
                                    const isDownloading =
                                        downloadingCertificateKey === downloadKey;
                                    const isBusy =
                                        certificateActionStudentId === student.id ||
                                        loadingCertificateWorkspace;
                                    const activeActionKind =
                                        certificateActionStudentId === student.id
                                            ? certificateActionKind
                                            : null;
                                    const eligibility = student.certificateEligibility || null;
                                    return (
                                        <article
                                            key={student.id}
                                            className={`dashboard-panel-muted rounded-panel p-5 transition duration-300 hover:-translate-y-1 hover:shadow-edubot-card ${
                                                isBusy ? 'opacity-80' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-base font-semibold text-edubot-ink dark:text-white">
                                                        {student.fullName}
                                                    </h3>
                                                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-edubot-muted dark:text-slate-400">
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiMail className="h-4 w-4 text-edubot-orange" />
                                                            {student.email || '—'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiPhone className="h-4 w-4 text-edubot-orange" />
                                                            {student.phoneNumber || '—'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getCertificateBadge(
                                                        student.certificateStatus
                                                    )}`}
                                                >
                                                    {getStudentCertificateStatusLabel(
                                                        student.certificateStatus,
                                                        t
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                {canIssueCertificates ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onCertificateAction(
                                                                'issue',
                                                                student,
                                                                getCertificateDisplayPayload(student)
                                                            )
                                                        }
                                                        disabled={!issueState.canIssue || isBusy}
                                                        className={`${
                                                            issueState.canIssue
                                                                ? 'dashboard-button-primary'
                                                                : 'dashboard-button-secondary'
                                                        }`}
                                                    >
                                                        {activeActionKind === 'issue'
                                                            ? t('adminCertificates.actions.issuing')
                                                            : issueState.buttonLabel}
                                                    </button>
                                                ) : null}
                                                {canApproveCertificates &&
                                                student.certificateStatus ===
                                                    'pending_approval' ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onCertificateAction(
                                                                    'approve',
                                                                    student,
                                                                    getCertificateDisplayPayload(
                                                                        student
                                                                    )
                                                                )
                                                            }
                                                            disabled={isBusy}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            {activeActionKind === 'approve'
                                                                ? t('adminCertificates.actions.approving')
                                                                : t('adminCertificates.actions.approve')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onCertificateAction(
                                                                    'reject',
                                                                    student
                                                                )
                                                            }
                                                            disabled={isBusy}
                                                            className="dashboard-button-secondary"
                                                        >
                                                            {activeActionKind === 'reject'
                                                                ? t('adminCertificates.actions.sending')
                                                                : t('adminCertificates.actions.reject')}
                                                        </button>
                                                    </>
                                                ) : null}
                                                {student.certificateStatus === 'issued' ? (
                                                    <>
                                                        {student.certificateDownloadUrl ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDownloadCertificate(
                                                                        student.certificateDownloadUrl,
                                                                        `certificate-${student.certificatePublicId || student.id}.pdf`,
                                                                        downloadKey
                                                                    )
                                                                }
                                                                disabled={isDownloading}
                                                                className="dashboard-button-secondary"
                                                            >
                                                                {isDownloading
                                                                    ? t('common.loadingEllipsis')
                                                                    : t('adminCertificates.actions.downloadPdf')}
                                                            </button>
                                                        ) : null}
                                                        {student.certificateVerificationUrl ? (
                                                            <a
                                                                href={
                                                                    student.certificateVerificationUrl
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="dashboard-button-secondary"
                                                            >
                                                                {t('adminCertificates.actions.verify')}
                                                            </a>
                                                        ) : null}
                                                        {canRevokeCertificates ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    onCertificateAction(
                                                                        'revoke',
                                                                        student
                                                                    )
                                                                }
                                                                disabled={isBusy}
                                                                className="dashboard-button-secondary"
                                                            >
                                                                {activeActionKind === 'revoke'
                                                                    ? t('adminCertificates.actions.revoking')
                                                                    : t('adminCertificates.actions.revoke')}
                                                            </button>
                                                        ) : null}
                                                    </>
                                                ) : null}
                                            </div>
                                            <p className={`mt-3 text-sm ${issueState.helperTone}`}>
                                                {issueState.helperText}
                                            </p>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="dashboard-panel rounded-2xl border border-edubot-line/70 px-4 py-3 dark:border-slate-700">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                        {t('adminCertificates.studentCard.enrolledAt')}
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {formatDate(student.enrolledAt, i18n.language)}
                                                    </div>
                                                </div>
                                                <div className="dashboard-panel rounded-2xl border border-edubot-line/70 px-4 py-3 dark:border-slate-700">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-edubot-muted dark:text-slate-400">
                                                        {eligibility?.mode === 'delivery'
                                                            ? t('adminCertificates.studentCard.completion')
                                                            : t('common.progress')}
                                                    </div>
                                                    <div className="mt-2 text-sm font-semibold text-edubot-ink dark:text-white">
                                                        {Math.max(
                                                            0,
                                                            Math.min(
                                                                100,
                                                                Number(student.progressPercent || 0)
                                                            )
                                                        )}
                                                        %
                                                    </div>
                                                </div>
                                            </div>
                                            {eligibility?.mode === 'delivery' ? (
                                                <div className="mt-3 grid gap-2 text-xs text-edubot-muted dark:text-slate-400 sm:grid-cols-3">
                                                    <div>
                                                        {t('adminCertificates.page.students.eligibility.attendance')}{' '}
                                                        <span className="font-semibold text-edubot-ink dark:text-white">
                                                            {eligibility.attendance?.percent ?? 0}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        {t('adminCertificates.page.students.eligibility.homework')}{' '}
                                                        <span className="font-semibold text-edubot-ink dark:text-white">
                                                            {eligibility.homework?.percent ?? 0}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        {t('adminCertificates.page.students.eligibility.activities')}{' '}
                                                        <span className="font-semibold text-edubot-ink dark:text-white">
                                                            {eligibility.activities?.percent ?? 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </article>
                                    );
                                })}
                            </div>
                        </DashboardInsetPanel>
                    ) : (
                        <DashboardInsetPanel
                            title={t('adminCertificates.page.students.title')}
                            description={
                                selectedStudentId
                                    ? t('adminCertificates.page.students.selectedNotFoundDescription')
                                    : t('adminCertificates.page.students.emptyDescription')
                            }
                        >
                            <EmptyState
                                title={
                                    selectedStudentId
                                        ? t('adminCertificates.page.students.selectedNotFoundTitle')
                                        : t('adminCertificates.page.students.emptyTitle')
                                }
                                subtitle={
                                    selectedStudentId
                                        ? t('adminCertificates.page.students.selectedNotFoundSubtitle')
                                        : t('adminCertificates.page.students.emptySubtitle')
                                }
                                icon={<FiUsers className="h-8 w-8 text-edubot-orange" />}
                                className="py-8"
                            />
                        </DashboardInsetPanel>
                    )}

                    {courseMeta?.totalPages > 1 ? (
                        <div className="flex items-center justify-between gap-3 pt-1 text-sm text-edubot-muted dark:text-slate-400">
                            <button
                                type="button"
                                onClick={() => onChangePage(Math.max(1, studentsPage - 1))}
                                disabled={studentsPage <= 1}
                                className="dashboard-button-secondary disabled:opacity-50"
                            >
                                <FiChevronLeft className="h-4 w-4" />
                                {t('adminCertificates.page.pagination.previous')}
                            </button>
                            <span>
                                {t('adminCertificates.page.pagination.page', {
                                    page: studentsPage,
                                    total: courseMeta.totalPages,
                                })}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onChangePage(
                                        Math.min(courseMeta.totalPages || 1, studentsPage + 1)
                                    )
                                }
                                disabled={studentsPage >= (courseMeta.totalPages || 1)}
                                className="dashboard-button-secondary disabled:opacity-50"
                            >
                                {t('adminCertificates.page.pagination.next')}
                                <FiChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    ) : null}
                </>
            )}

            <BasicModal
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
                size="xl"
                className="bg-white dark:bg-slate-950"
            >
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-base font-semibold text-edubot-ink dark:text-white">
                                {t('adminCertificates.page.signatureModal.title')}
                            </p>
                            <p className="mt-1 text-sm text-edubot-muted dark:text-slate-400">
                                {t('adminCertificates.page.signatureModal.description')}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSignatureModalOpen(false)}
                            className="rounded-full border border-edubot-line/70 bg-white p-2 text-edubot-muted transition hover:text-edubot-ink dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white"
                            aria-label={t('common.close')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    <SignaturePad
                        disabled={savingCertificateAssetKind === 'signature'}
                        onSave={async (file) => {
                            const updated = await handleSignatureAssetSave(file);
                            if (updated) {
                                setIsSignatureModalOpen(false);
                            }
                            return updated;
                        }}
                    />
                </div>
            </BasicModal>

            <BasicModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                size="full"
                showCloseButton={false}
                className="min-h-[94vh] bg-slate-800"
                contentClassName="max-h-[92vh] overflow-y-auto"
            >
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 px-1 py-1">
                        <p className="text-sm font-medium text-slate-300">
                            {t('adminCertificates.page.template.preview.fullPreview')}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="rounded-full border border-slate-600 bg-slate-900/80 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
                            aria-label={t('common.close')}
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>
                    {exactPreviewLoading ? (
                        <div className="flex min-h-[86vh] items-center justify-center rounded-[24px] border border-slate-700 bg-white text-slate-500">
                            {t('adminCertificates.page.template.preview.exactLoading')}
                        </div>
                    ) : exactPreviewError ? (
                        <div className="flex min-h-[86vh] items-center justify-center rounded-[24px] border border-red-500/30 bg-red-500/10 px-6 text-center text-red-200">
                            {exactPreviewError}
                        </div>
                    ) : shouldShowExactPreview ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => loadExactPreview()}
                            disabled={exactPreviewLoading || !selectedCourseId}
                            className="dashboard-button-secondary absolute right-4 top-4 z-10"
                        >
                                {t('adminCertificates.page.actions.refresh')}
                            </button>
                            <iframe
                                title={t('adminCertificates.page.template.preview.exactFrameTitle')}
                                srcDoc={exactPreviewHtml}
                                data-preview-surface="modal"
                                scrolling="no"
                                onLoad={handlePreviewFrameLoad('modal')}
                                className="h-[86vh] w-full overflow-hidden rounded-[24px] border border-slate-700 bg-white"
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-[86vh] items-center justify-center rounded-[24px] border border-slate-700 bg-white text-slate-500">
                            {t('adminCertificates.page.template.preview.unavailable')}
                        </div>
                    )}
                </div>
            </BasicModal>
        </div>
    );
};

export default CertificatesSection;
